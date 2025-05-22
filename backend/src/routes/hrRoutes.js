// src/routes/hrRoutes.js
const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const authenticateUser = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

router.get('/all', authenticateUser, checkRole(['hr']), hrController.getAllRequests);
router.get('/report', authenticateUser, checkRole(['hr']), hrController.generateReport);
router.get('/statistics', authenticateUser, checkRole(['hr']), hrController.getStatistics);

module.exports = router;



