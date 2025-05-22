const express = require('express');
const router = express.Router();
const departmentHeadController = require('../controllers/departmentHeadController');
const authenticateUser = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

router.get('/all-requests', authenticateUser, checkRole(['departmenthead']), departmentHeadController.getAllRequests);
router.get('/statistics', authenticateUser, checkRole(['departmenthead']), departmentHeadController.getStatistics);
router.put('/update/:id', authenticateUser, checkRole(['departmenthead']), departmentHeadController.updateRequestStatus);
  
module.exports = router;

