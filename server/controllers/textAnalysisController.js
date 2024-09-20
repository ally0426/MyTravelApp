const analyzeText = (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  // Example analysis logic (replace with actual NLP logic)
  const analysisResult = {
    message: `Analyzed text: ${text}`,
  };

  res.json(analysisResult);
};

// Export the function
module.exports = { analyzeText };
