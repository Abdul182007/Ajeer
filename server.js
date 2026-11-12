require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET ||
    !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  console.error("Missing required environment variables. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/employees", require("./routes/employees"));
app.get("/permit/:permitNumber", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "permit.html"));
});
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res) => res.status(404).json({ message: "Route not found." }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error. Check the backend terminal." });
});

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000
}).then(() => {
  console.log("Connected to MongoDB Atlas.");
  app.listen(PORT, () => console.log(`Website running at http://localhost:${PORT}`));
}).catch((err) => {
  console.error("MongoDB connection failed:", err.message);
  process.exit(1);
});
