// processManagerController.js
const LeaveRequest = require("../models/LeaveRequest");
const { convertBase64ToPng } = require("../utils/imageUtils");


// Get requests approved by department heads
exports.getApprovedRequests = async (req, res) => {
  try {
    console.log("Getting approved requests");

    const approvedRequests = await LeaveRequest.find({ status: "Approved" });
    console.log("Approved requests found:", approvedRequests);

    res.status(200).json(approvedRequests);
  } catch (error) {
    console.error("Error getting approved requests:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({ error: "Failed to fetch approved requests", details: error.message });
  }
};

// // Finalize requests with a digital signature
// exports.finalizeRequest = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { finalizedBy } = req.body;

//     console.log("Finalizing request with id:", id);
//     console.log("Finalized by:", finalizedBy);

//     const leaveRequest = await LeaveRequest.findByIdAndUpdate(
//       id,
//       { status: "Approved (Final)", finalizedBy },
//       { new: true }
//     );

//     console.log("Updated leave request:", leaveRequest);

//     if (!leaveRequest) {
//       console.log("Leave request not found with id:", id);
//       return res.status(404).json({ error: "Leave request not found" });
//     }

//     res.status(200).json({ message: "Request finalized", leaveRequest });
//   } catch (error) {
//     console.error("Error finalizing request:", error);
//     console.error("Error details:", error.message);
//     console.error("Error stack:", error.stack);

//     res.status(500).json({ error: "Failed to finalize request", details: error.message });
//   }
// };


exports.finalizeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;

    const imagePath = await convertBase64ToPng(signature);

    const updatedRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      {
        status: 'Finalized',
        processManagerSignature: {
          imagePath: imagePath,
          timestamp: new Date()
        }
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error finalizing request:", error);
    res.status(500).json({ error: "Failed to finalize request", details: error.message });
  }
};
