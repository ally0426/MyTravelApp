const analyzePlacePhoto = async (req, res) => {
  const photoPath = req.file.path;

  try {
    const response = await imageRecognitionAPI.analyze(photoPath);
    const analysis = response.data;

    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing place photo:', error);
    res.status(500).json({ error: 'Failed to analyze photo' });
  }
};

const analyzeMealPhoto = async (req, res) => {
  const photoPath = req.file.path;

  try {
    const response = await mealRecognitionAPI.analyze(photoPath);
    const analysis = response.data;

    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing meal photo:', error);
    res.status(500).json({ error: 'Failed to analyze meal photo' });
  }
};

module.exports = { analyzePlacePhoto, analyzeMealPhoto };