const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  fileName: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recordsProcessed: Number,
  studentsAdded: Number,
  hasErrors: Boolean
}, { timestamps: true });

module.exports = mongoose.model('Upload', uploadSchema);