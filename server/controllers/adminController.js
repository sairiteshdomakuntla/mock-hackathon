const csv = require('csv-parser');
const fs = require('fs');
const Student = require('../models/Student');

const bulkUpload = async (req, res) => {
  try {
    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const inserted = await Student.insertMany(results.map(row => ({
          name: row.name,
          age: row.age,
          class: row.class,
          teacherId: req.user._id
        })));

        res.json({ message: 'Upload successful', count: inserted.length });
      });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

module.exports = { bulkUpload };
