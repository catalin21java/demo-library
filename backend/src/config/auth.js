const DEFAULT_JWT_SECRET = "dev-only-change-me-in-production";

export const jwtSecret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(
    "JWT_SECRET is not set; using a development default. Set JWT_SECRET in production.",
  );
}
