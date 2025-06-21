const express = require('express');
const router = express.Router();
const {
  getStudents,
  addStudent,
  getStudentById,
  addReflection
} = require('../controllers/studentController');

const { protect } = require('../middlewares/authMiddleware');
const { isTeacher } = require('../middlewares/roleMiddleware');

router.use(protect, isTeacher);

router.get('/', getStudents);              // GET all students
router.post('/', addStudent);              // POST new student
router.get('/:id', getStudentById);        // GET individual student
router.post('/:id/reflection', addReflection); // POST a reflection

module.exports = router;
