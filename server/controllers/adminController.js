const csv = require('csv-parser');
const multer = require('multer');
const fs = require('fs');
const Student = require('../models/Student');
const User = require('../models/User');
const Upload = require('../models/Upload');

// Multer middleware
const upload = multer({ dest: 'uploads/' });

const uploadCSV = async (req, res) => {
  try {
    const students = [];
    const filePath = req.file.path;
    const errors = [];
    let processed = 0;

    // Save upload record
    const uploadRecord = new Upload({
      fileName: req.file.originalname,
      uploadedBy: req.user._id,
      recordsProcessed: 0,
      studentsAdded: 0,
      hasErrors: false
    });
    
    await uploadRecord.save();

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        students.push(row);
        processed++;
      })
      .on('end', async () => {
        const added = [];
        console.log(`Processing ${students.length} student records`);

        uploadRecord.recordsProcessed = students.length;
        
        for (const s of students) {
          try {
            // Check if all required fields are present
            if (!s.name || !s.teacherEmail) {
              errors.push(`Missing required fields for student: ${JSON.stringify(s)}`);
              continue;
            }

            // Log the teacher email we're searching for
            console.log(`Looking for teacher with email: ${s.teacherEmail}`);
            
            const teacher = await User.findOne({ 
              email: s.teacherEmail.trim(),
              role: 'teacher' 
            });
            
            if (!teacher) {
              errors.push(`No teacher found with email: ${s.teacherEmail}`);
              continue;
            }
            
            console.log(`Found teacher: ${teacher.name} (${teacher._id})`);

            const newStudent = new Student({
              name: s.name,
              age: s.age || null,
              class: s.class || 'Unassigned',
              teacherId: teacher._id,
              literacyScores: [],
              selScores: {
                empathy: s.empathy ? parseInt(s.empathy) : null,
                regulation: s.regulation ? parseInt(s.regulation) : null,
                cooperation: s.cooperation ? parseInt(s.cooperation) : null
              },
              reflections: [],
            });
            
            await newStudent.save();
            added.push(newStudent);
            console.log(`Added student: ${newStudent.name}`);
          } catch (err) {
            errors.push(`Error processing student ${s.name || 'unknown'}: ${err.message}`);
          }
        }

        // Update upload record
        uploadRecord.studentsAdded = added.length;
        uploadRecord.hasErrors = errors.length > 0;
        await uploadRecord.save();

        fs.unlinkSync(filePath); // cleanup
        
        // Send detailed response
        res.status(200).json({ 
          message: 'CSV upload completed', 
          count: added.length,
          processed: processed,
          errors: errors.length > 0 ? errors : undefined
        });
      })
      .on('error', (err) => {
        throw new Error(`CSV parsing error: ${err.message}`);
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'CSV upload failed', 
      error: err.message 
    });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get upload history
const getUploads = async (req, res) => {
  try {
    const uploads = await Upload.find().sort('-createdAt');
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching upload history' });
  }
};

// Get system overview stats
const getSystemStats = async (req, res) => {
  try {
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    const studentCount = await Student.countDocuments();
    const recentUploads = await Upload.countDocuments({ 
      createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });
    
    res.json({
      teacherCount,
      studentCount,
      recentUploads
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching system stats' });
  }
};

module.exports = {
  uploadCSV,
  uploadMiddleware: upload.single('file'),
  getUsers,
  getUploads,
  getSystemStats
};
