import type { Express } from "express";
import { onRequest } from "firebase-functions/v2/https";
import { createApp } from "./app";

/**
 * This file handles the asynchronous initialization of the Express app
 * and exports the final, wrapped Firebase Function.
 */

// Lazily initialize the Express app as a promise.
// This ensures that the async setup runs only once, the first time the function is invoked.
let appPromise: Promise<Express> | null = null;

const getApp = (): Promise<Express> => {
  if (!appPromise) {
    appPromise = createApp();
  }
  return appPromise;
};

// This is the actual handler that Firebase will call for each request.
export const api = onRequest(
  { secrets: ["SERVICE_ACCOUNT_KEY", "SESSION_SECRET"] },
  async (req, res) => {
    // Wait for the async app initialization to complete.
    const app = await getApp();
    // Pass the request to the fully initialized Express app to handle.
    return app(req, res);
  }
);
