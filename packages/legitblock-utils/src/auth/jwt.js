import crypto from "node:crypto";
import jwt from "jsonwebtoken";

/**
 * Retrieve the active JWT secret.
 * Enforces that in production, JWT_SECRET must be explicitly configured.
 * In development and test environments, an ephemeral cryptographically secure random secret is generated.
 */
function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("SECURITY ALERT: JWT_SECRET environment variable must be configured in production mode");
  }
  if (!globalThis.__LEGITBLOCK_DEV_JWT_SECRET) {
    globalThis.__LEGITBLOCK_DEV_JWT_SECRET = crypto.randomBytes(32).toString("hex");
  }
  return globalThis.__LEGITBLOCK_DEV_JWT_SECRET;
}

/**
 * Sign a JWT token for an authenticated user session
 * @param {object} payload - User information (id, username, email, role, groups)
 * @param {string} [expiresIn="24h"]
 * @returns {string} Signed JWT token
 */
export function signUserToken(payload, expiresIn = "24h") {
  return jwt.sign(payload, getJwtSecret(), { expiresIn, algorithm: "HS256" });
}

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {object|null} Decoded user payload or null if invalid
 */
export function verifyUserToken(token) {
  try {
    return jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
  } catch {
    return null;
  }
}
