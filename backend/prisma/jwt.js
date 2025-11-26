const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "change_this";

function signToken(payload, opts = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: opts.expiresIn || "1d" });
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      userId: decoded.sub,
      tenantId: decoded.tenantId,
      outletId: decoded.outletId,
      role: decoded.role,
    };
  } catch (e) {
    return null; // Return null if token is invalid or expired
  }
}

module.exports = { signToken, verifyToken };