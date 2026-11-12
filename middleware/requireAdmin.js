const jwt = require("jsonwebtoken");

module.exports = function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Admin login required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access only." });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Your login has expired. Please log in again." });
  }
};
