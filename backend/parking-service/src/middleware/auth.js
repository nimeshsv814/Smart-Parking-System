const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET || "smartparkingsecret");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

function requireService(req, res, next) {
  const serviceToken = req.headers["x-service-token"];
  if (serviceToken !== (process.env.SERVICE_TOKEN || "internal-service-token")) {
    return res.status(401).json({ message: "Unauthorized service request" });
  }
  next();
}

module.exports = {
  requireAuth,
  requireRole,
  requireService
};
