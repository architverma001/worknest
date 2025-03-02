const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

// Import Routes
const otpRoutes = require("./routes/otpRoutes");
const projectRoutes = require("./routes/ProjectRoutes"); // ✅ Consistent naming
const teamrouter = require("./routes/TeamMemberRoutes");
// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to database"))
  .catch((err) => console.error("❌ Connection failed:", err));

// Routes
app.use("/api/otp", otpRoutes);
app.use("/api/projects", projectRoutes); // ✅ Fixed missing slash
app.use("/api/team",teamrouter)

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
