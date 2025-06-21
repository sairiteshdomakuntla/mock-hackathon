const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reflection', reflectionSchema);
