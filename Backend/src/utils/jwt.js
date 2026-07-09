const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token containing the payload for regular users
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Verifies a regular user JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generates a signed JWT token containing the payload for admins using JWT_SECRET
 */
const generateAdminToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Verifies an admin JWT token using JWT_SECRET
 */
const verifyAdminToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
  generateAdminToken,
  verifyAdminToken
};
