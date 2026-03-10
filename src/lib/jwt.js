import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'workontap-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ─── Generate Token (for login) ───────────────────────────────────────────────
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// ─── Verify Token ─────────────────────────────────────────────────────────────
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verify error:', error.message);
    return null;
  }
}

// ─── Decode Token (without verifying) ────────────────────────────────────────
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

// ─── Generate Email Verification Token ───────────────────────────────────────
export function generateEmailVerificationToken(providerId, email) {
  return jwt.sign(
    { providerId, email, type: 'email_verification' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// ─── Verify Email Verification Token ─────────────────────────────────────────
export function verifyEmailVerificationToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'email_verification') return null;
    return decoded;
  } catch (error) {
    console.error('Email verification token error:', error.message);
    return null;
  }
}

// ─── Generate Password Reset Token ───────────────────────────────────────────
export function generatePasswordResetToken(providerId, email) {
  return jwt.sign(
    { providerId, email, type: 'password_reset' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// ─── Verify Password Reset Token ─────────────────────────────────────────────
export function verifyPasswordResetToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'password_reset') return null;
    return decoded;
  } catch (error) {
    console.error('Password reset token error:', error.message);
    return null;
  }
}