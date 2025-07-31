// Extend Express session to include custom properties
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: any;
  }
}

export {};