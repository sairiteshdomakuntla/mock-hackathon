const express = require('express');
const router = express.Router();
const { getSuggestion } = require('../controllers/geminiController');
const { protect } = require('../middlewares/authMiddleware');
const { isTeacher } = require('../middlewares/roleMiddleware');

router.post('/suggest', protect, isTeacher, getSuggestion);

module.exports = router;
