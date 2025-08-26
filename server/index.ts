import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { setupSecurity } from "./security";
import { onRequest } from "firebase-functions/v2/https";
import "dotenv/config";
import { initializeApp, cert, getApp } from 'firebase-admin/app';

// Declare api at the top level
export let api: any; 

// =================================================================
// PROVA REAL: Log de Depuração para a Variável de Ambiente em Produção
// =================================================================
if (process.env.NODE_ENV !== "development") {
  console.log("--- Production Environment Debug Log ---");
  const key = process.env.SERVICE_ACCOUNT_KEY;
  if (key && key.length > 1) {
    console.log("✅ SERVICE_ACCOUNT_KEY is DEFINED.");
    console.log(`Type: ${typeof key}`);
    console.log(`Starts with: ${key.substring(0, 20)}...`); // Log seguro para confirmar o formato
  } else {
    console.error("❌ CRITICAL: SERVICE_ACCOUNT_KEY is NOT DEFINED or empty.");
  }
  console.log("------------------------------------");
}

// Initialize Firebase Admin SDK
if (!getApp()) {
  try {
    const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY; 
    if (!serviceAccountKey) {
      console.warn("SERVICE_ACCOUNT_KEY is not set. Using default application credentials on production or this will fail.");
      initializeApp();
    } else {
      initializeApp({
        credential: cert(JSON.parse(serviceAccountKey)),
      });
      console.log("✅ Firebase Admin SDK initialized successfully from service account key.");
    }
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
  }
}

async function createApp() {
  const app = express();
  setupSecurity(app);
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  await registerRoutes(app);
  return app;
}

// Handle local development or Firebase Functions deployment
if (process.env.NODE_ENV === "development") {
  createApp().then(app => {
    const PORT = process.env.PORT || 5000;
    const httpServer = app.listen(PORT, () => {
      console.log(`🚀 Local development server listening on port ${PORT}`);
    });
    setupVite(app, httpServer);
  }).catch(error => {
    console.error("❌ Failed to start local development server:", error);
  });
} else {
  // Para implantação do Firebase Cloud Functions
  api = onRequest({ secrets: ["SERVICE_ACCOUNT_KEY"] }, async (req, res) => {
    const app = await createApp();
    return app(req, res);
  });
}
