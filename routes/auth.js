const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const router = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again in 15 minutes." }
});

router.post("/login", loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  const valid =
    typeof username === "string" &&
    typeof password === "string" &&
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD;

  if (!valid) return res.status(401).json({ message: "Incorrect username or password." });

  const token = jwt.sign(
    { role: "admin", username },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token, username, expiresIn: "8h" });
});

module.exports = router;
