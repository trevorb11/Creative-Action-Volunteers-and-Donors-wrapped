import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupDatabase } from "./db-setup";
import { setupKeepAlive } from "./keep-alive";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Initialize the database
    await setupDatabase();
    log("Database initialized successfully");
    
    // Register API routes
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error("Error:", err);
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client
    const port = process.env.PORT || 5000;
    
    // Enable keep-alive connections
    server.keepAliveTimeout = 65000; // 65 seconds - higher than default of ALB/ELB (60 seconds)
    server.headersTimeout = 66000; // Ensure this is higher than keepAliveTimeout
    
    // Add error handling for the server
    server.on('error', (error: Error) => {
      console.error('Server error:', error);
      // Attempt to restart if the port is not in use
      if ((error as any).code === 'EADDRINUSE') {
        log(`Port ${port} is in use, attempting to restart...`);
        setTimeout(() => {
          server.close();
          server.listen({
            port,
            host: "0.0.0.0",
            reusePort: true,
          });
        }, 1000);
      }
    });
    
    // Add a ping route to keep the server active
    app.get('/ping', (_req, res) => {
      res.status(200).send('pong');
    });
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
      
      // Start the keep-alive mechanism once the server is running
      setupKeepAlive();
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
