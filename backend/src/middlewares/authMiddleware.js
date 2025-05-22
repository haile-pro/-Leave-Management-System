const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("No token provided in request headers");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    console.log("Verifying token with secret:", process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified successfully. Decoded user info:", decoded);
    req.user = decoded; // Attach user info to request object
    next();
  } catch (err) {
    console.error("Error verifying token:", err);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = authenticateUser;

