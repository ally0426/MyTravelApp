// server/routes/nlpRoutes.js

const express = require("express");
const { analyzeText } = require("../controllers/nlpController");

const router = express.Router();

// Define route for analyzing text
router.post("/analyze-text", analyzeText);

module.exports = router;
