const express = require('express');
const router = express.Router();
const { getSuggestion, getStatus } = require('../controllers/geminiController');
const { protect } = require('../middlewares/authMiddleware');
const { isTeacher } = require('../middlewares/roleMiddleware');

// All routes require authentication and teacher role
router.use(protect, isTeacher);

// Get teaching suggestion for a student
router.post('/suggestion', getSuggestion);

// Get status
router.get('/status', getStatus);

module.exports = router;
