// Role-based authorization middleware
// Must be used after authenticateToken middleware

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated (should be set by authenticateToken)
      if (!req.user || !req.user.sub) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Get user role from the token or user object
      const userRole = req.user.role;
      
      if (!userRole) {
        return res.status(403).json({ message: 'User role not found' });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
        });
      }

      // User is authorized, proceed to next middleware
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
};

module.exports = authorizeRole;
