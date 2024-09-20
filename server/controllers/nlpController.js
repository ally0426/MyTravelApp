// server/controllers/nlpController.js

const axios = require("axios");
const { google } = require("googleapis");
require("dotenv").config(); // Load environment variables from .env file

// Use Google Cloud's OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID, // OAuth2 Client ID
  process.env.GOOGLE_CLIENT_SECRET, // OAuth2 Client Secret
  "urn:ietf:wg:oauth:2.0:oob" // Redirect URL (for desktop/command-line apps)
);

// Function to generate OAuth2 token
async function getAccessToken() {
  const { token } = await oauth2Client.getAccessToken();
  return token;
}

const analyzeText = async (req, res) => {
  const { text } = req.body;

  // Log the received text value for debugging
  console.log("Received text:", text);

  // Check if text is missing or not a string
  if (!text) {
    return res.status(400).json({
      error: "Text is missing in the request body.",
    });
  }
  if (typeof text !== "string") {
    return res.status(400).json({
      error: "Text must be a string.",
    });
  }

  try {
    const endpoint = process.env.NLP_API_ENDPOINT;
    const accessToken = await getAccessToken(); // Get the OAuth2 access token

    console.log("Sending request to Google Cloud NLP API at:", endpoint);

    // Send the request to the Google Cloud Natural Language API
    const response = await axios.post(
      endpoint,
      {
        document: {
          type: "PLAIN_TEXT",
          content: text,
        },
        encodingType: "UTF8",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Use OAuth2 token for authentication
          "Content-Type": "application/json",
        },
      }
    );

    const analysis = response.data;
    res.json(analysis);
  } catch (error) {
    console.error("Error analyzing text:", error.message || error);
    if (error.response) {
      console.error("API Response Error:", error.response.data);
      console.error("Status Code:", error.response.status);
    }
    res.status(500).json({ error: "Failed to analyze text" });
  }
};

module.exports = { analyzeText };
