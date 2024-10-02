// const { OAuth2Client } = require("google-auth-library");
// const axios = require("axios");

// const client = new OAuth2Client(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI,
//   process.env.GOOGLE_API_KEY,
//   process.env.NLP_API_ENDPOINT,
//   process.env.PLACES_API_KEY
// );
// console.log("client on top of recommendationController.js: ", client);

// // Helper function to verify the token with Google
// const verifyToken = async (token) => {
//   console.log(`token TOKENNNNNN: ${token}`);
//   try {
//     const response = await axios.get(
//       "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}"
//     );
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error verifying token:",
//       error.response ? error.response.data : error.message
//     );
//     throw new Error("Invalid or expired token in recommendationController.js");
//   }
// };

const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Replace with your actual Google Client ID

// Function to refresh access token using refresh token
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const newAccessToken = response.data.access_token;
    console.log("New Access Token:", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw new Error("Unable to refresh access token");
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

  console.log("req.headers: ", JSON.stringify(req.headers, null, 2));
  // console.log(
  //   "req.headers.authorization: ",
  //   JSON.stringify(req.headers.authorization, null, 2)
  // );

  const token = req.headers.authorization?.split(" ")[1]; // Extract OAuth token from the header
  console.log("token in recommendationController.js: ", token);

  if (!token) {
    return res
      .status(401)
      .json({ error: "401 error, authorization token is missing." });
  }

  try {
    // Verify the token using Google's OAuth2Client
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Ensure this matches your Google Client ID
    });
    const payload = ticket.getPayload();
    console.log("Verified user info:", payload);
    // Continue with the recommendations logic after token verification
    const recommendations = generateRecommendations(payload); // Or whatever your logic is
    res.status(200).json({ recommendations });
  } catch (error) {
    console.error("Token verificatino failed: ", error.message);
    res.status(401).json({ error: "Invalid token" });
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

