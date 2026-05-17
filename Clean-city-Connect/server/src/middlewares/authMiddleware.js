import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Auth middleware – verifies JWT token from Authorization header.
 * Attaches req.user = { id, role } to the request.
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Officer-only middleware – must be used AFTER authMiddleware.
 */
export function officerOnly(req, res, next) {
  if (req.user?.role !== 'officer') {
    return res.status(403).json({ message: 'Officer access required' });
  }
  next();
}
