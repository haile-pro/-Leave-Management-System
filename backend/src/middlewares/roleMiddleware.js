// src/middlewares/roleMiddleware.js
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: User not authenticated" });
      }
  
      const userRole = req.user.role.toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
  
      console.log('User role:', userRole);
      console.log('Allowed roles:', normalizedAllowedRoles);
  
      if (!normalizedAllowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      }
  
      next();
    };
  };
  
  module.exports = checkRole;
  
  