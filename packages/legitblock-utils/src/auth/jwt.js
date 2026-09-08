import jwt from "jsonwebtoken";

const DEFAULT_SECRET = process.env.JWT_SECRET || "legitblock-secret-governance-key-2026";

/**
 * Sign a JWT token for an authenticated user session
 * @param {object} payload - User information (id, username, email, role, groups)
 * @param {string} [expiresIn="24h"]
 * @returns {string} Signed JWT token
 */
export function signUserToken(payload, expiresIn = "24h") {
  return jwt.sign(payload, DEFAULT_SECRET, { expiresIn });
}

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {object|null} Decoded user payload or null if invalid
 */
export function verifyUserToken(token) {
  try {
    return jwt.verify(token, DEFAULT_SECRET);
  } catch {
    return null;
  }
}
