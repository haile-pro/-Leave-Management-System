const express = require("express");
const {
  submitLeaveRequest,
  getLeaveRequests,
  updateLeaveRequest,
} = require("../controllers/applicantController");
const authenticateUser = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

const router = express.Router();

// Routes
router.post("/submit", authenticateUser, checkRole(["applicant"]), submitLeaveRequest);
router.get("/", authenticateUser, checkRole(["applicant"]), getLeaveRequests);
router.put("/:id", authenticateUser, checkRole(["applicant"]), updateLeaveRequest);

module.exports = router;  

