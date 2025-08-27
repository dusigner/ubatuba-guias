import { onRequest } from "firebase-functions/v2/https";
import { createApp } from "./app";

/**
 * This is the main entry point for the production Firebase Function.
 * It specifies that the 'SESSION_SECRET' is required for this function to run.
 */
export const api = onRequest(
  { secrets: ["SERVICE_ACCOUNT_KEY", "SESSION_SECRET"] },
  createApp()
);
