import express from "express";
import "dotenv/config";
import { initializeApp, cert, getApp, App } from 'firebase-admin/app';
import { createApiRouter } from "./routes";
import { setupSecurity } from "./security";

function initializeFirebase(): App {
  try {
    return getApp();
  } catch (error) {
    const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY;
    if (process.env.NODE_ENV === 'development' && serviceAccountKey) {
      try {
        const credentials = cert(JSON.parse(serviceAccountKey));
        return initializeApp({ credential: credentials });
      } catch (parseError) {
        console.error("Failed to parse SERVICE_ACCOUNT_KEY:", parseError);
        return initializeApp();
      }
    }
    return initializeApp();
  }
}

export async function createApp() {
  initializeFirebase();
  const app = express();

  // Configurar segurança primeiro (inclui CORS)
  setupSecurity(app);
  
  // Configurar body parsers
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  
  // Adicionar cookie parser para debug
  if (process.env.NODE_ENV === 'production') {
    const cookieParser = await import('cookie-parser');
    app.use(cookieParser.default());
  }
  
  // Criar rotas (setupSession será chamado dentro de createApiRouter)
  const apiRouter = await createApiRouter(app);
  app.use("/api", apiRouter);
  
  return app;
}
