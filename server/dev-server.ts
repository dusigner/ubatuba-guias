/**
 * This is the entry point for the LOCAL DEVELOPMENT server.
 * It imports the Express app from app.ts and starts a local server.
 * It also dynamically imports and attaches the Vite development server.
 * This file is NOT used in production.
 */
import { createServer } from "http";
import { createApp } from "./app";

// Use a self-executing async function to keep top-level await clean
(async () => {
  try {
    const app = await createApp();
    const server = createServer(app);
    const port = process.env.PORT || 8080;

    // Dynamically import Vite and attach its dev server middleware
    // This prevents Vite from being a production dependency
    const { setupVite } = await import("./vite");
    await setupVite(app, server);

    server.listen(port, () => {
      console.log(`🚀 Development server running at http://localhost:${port}`);
      console.log(`👉 API available at http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error("❌ Error starting development server:", error);
    process.exit(1);
  }
})();
