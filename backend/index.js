// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const path = require('path');
const errorHandler = require("./src/middlewares/errorMiddleware");

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const applicantRoutes = require("./src/routes/applicantRoutes");
const departmentHeadRoutes = require("./src/routes/departmentHeadRoutes");
const processManagerRoutes = require("./src/routes/processManagerRoutes");
const hrRoutes = require("./src/routes/hrRoutes");

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all origins


// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));



// Connect to the database
connectDB();   

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/applicants", applicantRoutes);
app.use("/api/department-head", departmentHeadRoutes);
app.use("/api/process-manager", processManagerRoutes);
app.use("/api/hr", hrRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



