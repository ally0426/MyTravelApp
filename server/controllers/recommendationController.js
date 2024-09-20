const axios = require("axios");

// Heler fuctgion to verify the token with Google
const verifyToken = async (token) => {
  console.log(`token TOKENNNNNN: ${token}`);
  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}"
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error verifying token:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Invalid or expired token in recommendationController.js");
  }
};

// Helper function to analyze text using Google NLP API and OAuth token
const analyzeTextWithNLP = async (text, token) => {
  const nlpEndpoint =
    "https://language.googleapis.com/v1/documents:analyzeEntities";

  try {
    // Send the text to Google NLP API for entity analysis
    const response = await axios.post(
      nlpEndpoint,
      {
        document: {
          type: "PLAIN_TEXT",
          content: text,
        },
        encodingType: "UTF8",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // OAuth 2.0 token
        },
      }
    );

    return response.data.entities; // Extract the recognized entities from the NLP result
  } catch (error) {
    console.error(
      "Error analyzing text with Google NLP:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to analyze text in recommendationController.js");
  }
};

// Function to generate real recommendations based on extracted entities
const generateRecommendations = (entities) => {
  const recommendations = [];

  // Analyze entities and provide recommendations
  entities.forEach((entity) => {
    if (entity.type === "LOCATION") {
      recommendations.push({
        name: entity.name,
        type: "sightseeing",
        distance: Math.random() * 10, // Mock distance for demonstration
      });
    } else if (entity.type === "ORGANIZATION") {
      recommendations.push({
        name: entity.name,
        type: "museum",
        distance: Math.random() * 10, // Mock distance for demonstration
      });
    } else if (entity.type === "CONSUMER_GOOD") {
      recommendations.push({
        name: entity.name,
        type: "restaurant",
        distance: Math.random() * 10, // Mock distance for demonstration
      });
    }
  });

  return recommendations;
};

// Main controller function to handle recommendations
const getRecommendations = async (req, res) => {
  const { userPreferences, analyzedPhotos, mealPhoto } = req.body;
  console.log(`req.headers.authorization: ${req.headers.authorization}`);
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1]; // Extract OAuth token from the header

  if (!token) {
    return res
      .status(401)
      .json({ error: "401 error, authorization token is missing." });
  }

  try {
    let analysisResult;

    // Analyze based on user input (userPreferences, photo description, or meal photo)
    if (userPreferences && userPreferences.interests) {
      const preferencesText = userPreferences.interests.join(", ");
      analysisResult = await analyzeTextWithNLP(preferencesText, token); // NLP analysis for preferences
    } else if (analyzedPhotos && analyzedPhotos.photoDescription) {
      analysisResult = await analyzeTextWithNLP(
        analyzedPhotos.photoDescription,
        token
      ); // NLP analysis for place photo
    } else if (mealPhoto && mealPhoto.mealPhotoDescription) {
      analysisResult = await analyzeTextWithNLP(
        mealPhoto.mealPhotoDescription,
        token
      ); // NLP analysis for meal photo
    } else {
      return res
        .status(400)
        .json({ error: "Text or photo description is required." });
    }

    // Generate recommendations based on NLP analysis results
    const recommendations = generateRecommendations(analysisResult);

    res.json({ recommendations });
  } catch (error) {
    console.error("Error generating recommendations:", error.message);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
};

module.exports = { getRecommendations };
