// src/routes/processManagerRoutes.js

const express = require("express");
const { getApprovedRequests, finalizeRequest } = require("../controllers/processManagerController");

const router = express.Router();

router.get("/approved", getApprovedRequests);
router.put("/finalize/:id", finalizeRequest);

module.exports = router;
