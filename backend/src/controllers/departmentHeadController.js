// departmentHeadController.js
const LeaveRequest = require("../models/LeaveRequest");
const { convertBase64ToPng } = require("../utils/imageUtils");
const User = require("../models/User"); 



// Get pending leave requests for a specific department
exports.getPendingRequests = async (req, res) => {
  try {
    const { department } = req.query;
    console.log("Getting pending requests for department:", department);

    const pendingRequests = await LeaveRequest.find({ department, status: "Pending" });
    console.log("Pending requests found:", pendingRequests);

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error("Error getting pending requests:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({ error: "Failed to fetch pending requests", details: error.message });
  }
};

// Approve or deny leave requests

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, signature } = req.body;

    const updateData = {
      status,
      $push: { comments: comment }
    };

    if (status === 'Approved' && signature) {
      const imagePath = await convertBase64ToPng(signature);
      updateData.departmentHeadSignature = {
        imagePath: imagePath,
        timestamp: new Date()
      };
    }

    const updatedRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ error: "Failed to update request status", details: error.message });
  }
};




// Get all leave requests

exports.getAllRequests = async (req, res) => {
  try {
    console.log("Getting all leave requests");
    const allRequests = await LeaveRequest.find().sort({ createdAt: -1 });
    console.log("All requests found:", allRequests.length);
    res.status(200).json(allRequests);
  } catch (error) {
    console.error("Error getting all requests:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Failed to fetch all requests", details: error.message });
  }
};


// Get department statistics


exports.getStatistics = async (req, res) => {
  try {
    console.log("Fetching department statistics");
    console.log("User ID:", req.user.id);
    
    const departmentHead = await User.findById(req.user.id);
    console.log("Department Head:", departmentHead);
    
    if (!departmentHead) {
      console.log("Department head not found");
      return res.status(404).json({ error: "Department head not found" });
    }
    
    if (!departmentHead.department) {
      console.log("Department head not assigned to a department");
      return res.status(400).json({ error: "Department head not assigned to a department" });
    }
    
    const department = departmentHead.department;
    console.log("Department:", department);

    const totalRequests = await LeaveRequest.countDocuments({ department });
    const approvedRequests = await LeaveRequest.countDocuments({ department, status: 'Approved' });
    const pendingRequests = await LeaveRequest.countDocuments({ department, status: 'Pending' });
    const deniedRequests = await LeaveRequest.countDocuments({ department, status: 'Denied' });

    const averageDuration = await LeaveRequest.aggregate([
      { $match: { department } },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: [{ $toDate: "$endDate" }, { $toDate: "$startDate" }] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      { $group: { _id: null, averageDuration: { $avg: "$duration" } } }
    ]);

    const leaveTypeStats = await LeaveRequest.aggregate([
      { $match: { department } },
      { $group: { _id: "$reason", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const monthlyTrends = await LeaveRequest.aggregate([
      { $match: { department } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$startDate" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    const topEmployees = await LeaveRequest.aggregate([
      { $match: { department, status: 'Approved' } },
      {
        $group: {
          _id: "$name",
          totalDays: {
            $sum: {
              $divide: [
                { $subtract: [{ $toDate: "$endDate" }, { $toDate: "$startDate" }] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      { $sort: { totalDays: -1 } },
      { $limit: 5 }
    ]);

    const longPendingRequests = await LeaveRequest.countDocuments({
      department,
      status: 'Pending',
      startDate: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalRequests,
      approvedRequests,
      pendingRequests,
      deniedRequests,
      averageDuration: averageDuration[0]?.averageDuration || 0,
      leaveTypeStats,
      monthlyTrends,
      topEmployees,
      longPendingRequests
    });
  } catch (error) {
    console.error("Error in getStatistics:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};








