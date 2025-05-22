// hrController.js
const LeaveRequest = require("../models/LeaveRequest");
const { Parser } = require('json2csv');


// Track all leave requests
exports.getAllRequests = async (req, res) => {
  try {
    console.log("Getting all leave requests");

    const leaveRequests = await LeaveRequest.find();
    console.log("Leave requests found:", leaveRequests);

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error("Error getting leave requests:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({ error: "Failed to fetch leave requests", details: error.message });
  }
};




// Generate reports
exports.generateReport = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = department ? { department } : {};
    const requests = await LeaveRequest.find(filter).sort({ createdAt: -1 });

    const fields = [
      'name',
      'department',
      'startDate',
      'endDate',
      'reason',
      'status',
      'departmentHeadSignature.imagePath',
      'departmentHeadSignature.timestamp',
      'processManagerSignature.imagePath',
      'processManagerSignature.timestamp'
    ];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(requests);

    res.header('Content-Type', 'text/csv');
    res.attachment('leave_requests_report.csv');
    return res.send(csv);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report", details: error.message });
  }
};




exports.generateReport = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = department ? { department } : {};
    const requests = await LeaveRequest.find(filter).sort({ createdAt: -1 });

    const fields = [
      'name',
      'department',
      'startDate',
      'endDate',
      'reason',
      'status',
      'departmentHeadSignature.imagePath',
      'departmentHeadSignature.timestamp',
      'processManagerSignature.imagePath',
      'processManagerSignature.timestamp'
    ];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(requests);

    res.header('Content-Type', 'text/csv');
    res.attachment('leave_requests_report.csv');
    return res.send(csv);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report", details: error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const totalRequests = await LeaveRequest.countDocuments();
    const approvedRequests = await LeaveRequest.countDocuments({ status: 'Approved' });
    const pendingRequests = await LeaveRequest.countDocuments({ status: 'Pending' });
    const deniedRequests = await LeaveRequest.countDocuments({ status: 'Denied' });

    const departmentStats = await LeaveRequest.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    const leaveTypeStats = await LeaveRequest.aggregate([
      { $group: { _id: "$reason", count: { $sum: 1 } } }
    ]);

    const averageDuration = await LeaveRequest.aggregate([
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ["$endDate", "$startDate"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      { $group: { _id: null, averageDuration: { $avg: "$duration" } } }
    ]);

    const monthlyTrends = await LeaveRequest.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const longPendingRequests = await LeaveRequest.countDocuments({
      status: 'Pending',
      createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      totalRequests,
      approvedRequests,
      pendingRequests,
      deniedRequests,
      departmentStats,
      leaveTypeStats,
      averageDuration: averageDuration[0]?.averageDuration || 0,
      monthlyTrends,
      longPendingRequests
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics", details: error.message });
  }
};
