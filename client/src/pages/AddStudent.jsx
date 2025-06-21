import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AddStudent = () => {
  const [form, setForm] = useState({
    name: '',
    age: '',
    class: '',
    literacyScores: [{ score: '' }],
    selScores: {
      empathy: '',
      regulation: '',
      cooperation: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('sel.')) {
      const selField = name.split('.')[1];
      setForm({
        ...form,
        selScores: {
          ...form.selScores,
          [selField]: value
        }
      });
    } else {
      setForm({
        ...form,
        [name]: value
      });
    }
  };

  const handleLiteracyScoreChange = (e, index) => {
    const newScores = [...form.literacyScores];
    newScores[index].score = e.target.value;
    setForm({
      ...form,
      literacyScores: newScores
    });
  };

  const addLiteracyScore = () => {
    setForm({
      ...form,
      literacyScores: [...form.literacyScores, { score: '' }]
    });
  };

  const removeLiteracyScore = (index) => {
    const newScores = form.literacyScores.filter((_, i) => i !== index);
    setForm({
      ...form,
      literacyScores: newScores
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Prepare the data
    const studentData = {
      name: form.name,
      age: form.age ? parseInt(form.age) : undefined,
      class: form.class,
      literacyScores: form.literacyScores
        .filter(item => item.score.trim() !== '')
        .map(item => ({
          score: parseFloat(item.score),
          date: new Date()
        })),
      selScores: {
        empathy: form.selScores.empathy ? parseInt(form.selScores.empathy) : undefined,
        regulation: form.selScores.regulation ? parseInt(form.selScores.regulation) : undefined,
        cooperation: form.selScores.cooperation ? parseInt(form.selScores.cooperation) : undefined
      }
    };
    
    try {
      await axios.post('http://localhost:5000/api/students', studentData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });
      
      navigate('/teacher');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Student</h1>
        <Link 
          to="/teacher" 
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Student Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  min="5"
                  max="18"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <input
                  type="text"
                  id="class"
                  name="class"
                  value={form.class}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. 3A"
                />
              </div>
            </div>

            {/* SEL Scores */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">SEL Competencies</h3>
              <p className="text-sm text-gray-500 mb-4">Rate on a scale from 1-5</p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="sel.empathy" className="block text-sm font-medium text-gray-700">
                    Empathy
                  </label>
                  <select
                    id="sel.empathy"
                    name="sel.empathy"
                    value={form.selScores.empathy}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select rating</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="sel.regulation" className="block text-sm font-medium text-gray-700">
                    Self-Regulation
                  </label>
                  <select
                    id="sel.regulation"
                    name="sel.regulation"
                    value={form.selScores.regulation}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select rating</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="sel.cooperation" className="block text-sm font-medium text-gray-700">
                    Cooperation
                  </label>
                  <select
                    id="sel.cooperation"
                    name="sel.cooperation"
                    value={form.selScores.cooperation}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select rating</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Literacy Scores */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">Literacy Assessment</h3>
                <button 
                  type="button" 
                  onClick={addLiteracyScore}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Add Score
                </button>
              </div>
              
              {form.literacyScores.map((score, index) => (
                <div key={index} className="flex items-center space-x-2 mt-2">
                  <div className="flex-grow">
                    <label htmlFor={`literacy-${index}`} className="block text-sm font-medium text-gray-700">
                      Score {index + 1}
                    </label>
                    <input
                      type="number"
                      id={`literacy-${index}`}
                      value={score.score}
                      onChange={(e) => handleLiteracyScoreChange(e, index)}
                      min="0"
                      max="100"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  {form.literacyScores.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLiteracyScore(index)}
                      className="mt-6 inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {loading ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;