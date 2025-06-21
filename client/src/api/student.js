import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Get all students for a teacher
export const getStudents = (token) => {
  return axios.get(`${BASE_URL}/students`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Get a specific student by ID
export const getStudentById = (id, token) => {
  return axios.get(`${BASE_URL}/students/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Add a new student
export const addStudent = (studentData, token) => {
  return axios.post(`${BASE_URL}/students`, studentData, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
};

// Add a reflection to a student
export const addReflection = (studentId, note, token) => {
  return axios.post(`${BASE_URL}/students/${studentId}/reflection`, { note }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
};