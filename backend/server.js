// server.js - The new application entry point.
require("dotenv").config();

// 2. Import the Express app definition.
const app = require("./app");

// 3. Define and start the server.
const PORT = process.env.PORT || 4000;

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});