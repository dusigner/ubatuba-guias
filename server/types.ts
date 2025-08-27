
// Extend Express session to include custom properties
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: any;
    uid?: string;
  }
}

// Declare the memorystore module
declare module 'memorystore' {
  import session from 'express-session';
  const MemoryStore: (session: typeof session) => new () => session.Store;
  export = MemoryStore;
}

export {};
