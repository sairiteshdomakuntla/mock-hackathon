const express = require('express');
const { 
  uploadCSV, 
  uploadMiddleware, 
  getUsers, 
  getUploads, 
  getSystemStats 
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Apply middleware to all routes
router.use(protect, isAdmin);

router.post('/upload-csv', uploadMiddleware, uploadCSV);
router.get('/users', getUsers);
router.get('/uploads', getUploads);
router.get('/stats', getSystemStats);

module.exports = router;
