const express = require('express');
const router = express.Router();
const { bulkUpload } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const upload = require('../utils/csvUploader'); // Multer config

router.post('/upload', protect, isAdmin, upload.single('file'), bulkUpload);

module.exports = router;
