const Student = require('../models/Student');

// GET all students for a teacher
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ teacherId: req.user._id });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students' });
  }
};

// POST add student
const addStudent = async (req, res) => {
  const { name, age, class: studentClass, literacyScores, selScores } = req.body;
  try {
    const student = new Student({
      name,
      age,
      class: studentClass,
      teacherId: req.user._id,
      literacyScores,
      selScores
    });

    const saved = await student.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Error creating student' });
  }
};

// GET individual student
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: 'Invalid ID' });
  }
};

// POST add reflection to student
const addReflection = async (req, res) => {
  const { note } = req.body;
  try {
    const student = await Student.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.reflections.push({ note });
    await student.save();

    res.json({ message: 'Reflection added', reflections: student.reflections });
  } catch (err) {
    res.status(400).json({ message: 'Could not add reflection' });
  }
};

module.exports = {
  getStudents,
  addStudent,
  getStudentById,
  addReflection
};
