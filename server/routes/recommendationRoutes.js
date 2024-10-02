// server/routes/recommendationRoutes.js

const express = require("express");
const {
  getRecommendations,
} = require("../controllers/recommendationController");

const router = express.Router();

// Define route for getting recommendations
router.post("/get-recommendations", getRecommendations);

module.exports = router;
