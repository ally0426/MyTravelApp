const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const nlpRoutes = require("./routes/nlpRoutes");
const photoRoutes = require("./routes/photoRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const app = express();

// Middleware setup
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse incoming JSON requests

// Routes
app.use("/api/nlp", nlpRoutes); // NLP routes
app.use("/api/photo", photoRoutes); // Photo analysis routes
app.use("/api/recommendations", recommendationRoutes); // Recommendation routes

// Server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
