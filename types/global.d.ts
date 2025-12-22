export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: "admin" | "staff" | "guest";
      approved?: boolean;
    };
  }
}
