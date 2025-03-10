import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupDatabase } from "./db-setup";
import { setupKeepAlive } from "./keep-alive";
import { createHttpServer, startServer } from "./server-manager";

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
    
    // Add a ping route to keep the server active
    app.get('/ping', (_req, res) => {
      res.status(200).send('pong');
    });

    // Add a health check endpoint
    app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'up',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });

    // Register API routes
    const server = await registerRoutes(app);

    // Enhanced error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Log the error with additional details in development
      console.error("Error:", err);
      
      // Send appropriate response based on environment
      res.status(status).json({ 
        message,
        // Include error details in development only
        ...(process.env.NODE_ENV !== 'production' && { 
          stack: err.stack,
          name: err.name
        })
      });
    });

    // Importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start the server with enhanced error handling and auto-restart capability
    startServer(server, app);
    
    // Start the keep-alive mechanism
    setupKeepAlive();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
