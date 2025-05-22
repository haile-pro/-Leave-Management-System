//src/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Applicant", "DepartmentHead", "ProcessManager", "HR"], required: true },
  department: { type: String, required: function() { return this.role === "DepartmentHead"; } },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);







