import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    verifyToken?: string; // Add your custom session properties
  }
}
