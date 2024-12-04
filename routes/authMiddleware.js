const Admin = require('./admin');

// Middleware to check roles
const checkRole = (roles) => {
  return (req, res, next) => {
    const admin = req.admin; // Assuming you authenticate admin and attach to `req.admin`

    if (!admin || !roles.includes(admin.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

// Middleware to check if the user is a club
function isClub(req, res, next) {
  if (req.user && req.user.role === 'club') {
    return next();
  }
  res.status(403).json({ message: 'Access denied: Club role required' });
}

// Example middleware for general authentication
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
}

// Export all functions together
module.exports = {
  isAuthenticated,
  isClub,
  checkRole,
};
