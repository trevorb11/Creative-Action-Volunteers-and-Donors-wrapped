import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set primary color for Spotify Wrapped style interface
document.documentElement.style.setProperty("--primary", "2AB674");
document.documentElement.style.setProperty("--secondary", "3F51B5");
document.documentElement.style.setProperty("--accent", "FF9800");

createRoot(document.getElementById("root")!).render(<App />);
