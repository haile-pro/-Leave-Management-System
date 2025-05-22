// applicantController.js
const LeaveRequest = require("../models/LeaveRequest");
   
exports.submitLeaveRequest = async (req, res) => {
  try {
    const { name, department, startDate, endDate, reason } = req.body;
    const newLeaveRequest = new LeaveRequest({
      applicantId: req.user.id, 
      name,
      department,
      startDate,
      endDate,
      reason,
      status: 'Pending'
    });
    await newLeaveRequest.save();
    console.log('New leave request submitted:', newLeaveRequest);
    res.status(201).json(newLeaveRequest);
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({ message: 'Error submitting leave request', error: error.message });
  }
};

exports.getLeaveRequests = async (req, res) => {
  try {
    console.log('Fetching leave requests for user:', req.user.id);
    const leaveRequests = await LeaveRequest.find({ applicantId: req.user.id }).sort({ createdAt: -1 });
    console.log('Leave requests found:', leaveRequests.length);
    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
};

exports.updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    const updatedRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      { status, comments },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error updating leave request:", error);
    res.status(500).json({ error: "Failed to update leave request", details: error.message });
  }
};

