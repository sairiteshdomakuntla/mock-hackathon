const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  age: Number,
  class: String,
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  literacyScores: [{ date: { type: Date, default: Date.now }, score: Number }],
  selScores: {
    empathy: Number,
    regulation: Number,
    cooperation: Number
  },
  reflections: [{ date: { type: Date, default: Date.now }, note: String }]
});

module.exports = mongoose.model('Student', studentSchema);
