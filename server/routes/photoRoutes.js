const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const photoController = require('../controllers/photoController');

router.post('/upload-place-photo', upload.single('photo'), photoController.analyzePlacePhoto);
router.post('/upload-meal-photo', upload.single('photo'), photoController.analyzeMealPhoto);

module.exports = router;