//src/models/LeaveRequest.js
const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema({
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Denied", "Finalized"], default: "Pending" },
  comments: { type: String },
  departmentHeadSignature: {
    imagePath: String,
    timestamp: Date
  },
  processManagerSignature: {
    imagePath: String,
    timestamp: Date
  }
}, { timestamps: true });

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);









