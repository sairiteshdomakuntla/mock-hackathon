import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reflection, setReflection] = useState('');
  const [submittingReflection, setSubmittingReflection] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [editingSEL, setEditingSEL] = useState(false);
  const [selForm, setSelForm] = useState({
    empathy: student?.selScores?.empathy || '',
    regulation: student?.selScores?.regulation || '',
    cooperation: student?.selScores?.cooperation || ''
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/students/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setStudent(response.data);
      } catch (err) {
        setError('Failed to load student data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, user.token]);

  const handleAddReflection = async (e) => {
    e.preventDefault();
    if (!reflection.trim()) return;
    
    setSubmittingReflection(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/students/${id}/reflection`,
        { note: reflection },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      
      // Update student with new reflections
      setStudent({
        ...student,
        reflections: response.data.reflections
      });
      
      // Clear form
      setReflection('');
    } catch (err) {
      setError('Failed to add reflection');
      console.error(err);
    } finally {
      setSubmittingReflection(false);
    }
  };

  const handleGetAISuggestion = async () => {
    setLoadingSuggestion(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/gemini/suggestion',
        {
          name: student.name,
          literacyScores: student.literacyScores,
          selScores: student.selScores
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      
      setAiSuggestion(response.data.suggestion);
    } catch (err) {
      setAiSuggestion('Failed to get AI suggestion. Please try again later.');
      console.error(err);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  // Calculates the average literacy score
  const calculateLiteracyAvg = () => {
    if (!student?.literacyScores || student.literacyScores.length === 0) {
      return 'N/A';
    }
    
    const sum = student.literacyScores.reduce((acc, score) => acc + (score.score || 0), 0);
    return (sum / student.literacyScores.length).toFixed(1);
  };

  const handleUpdateSEL = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:5000/api/students/${id}/sel-scores`,
        {
          empathy: selForm.empathy ? parseInt(selForm.empathy) : null,
          regulation: selForm.regulation ? parseInt(selForm.regulation) : null,
          cooperation: selForm.cooperation ? parseInt(selForm.cooperation) : null
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      
      // Update student data
      setStudent({
        ...student,
        selScores: response.data.selScores
      });
      
      // Exit edit mode
      setEditingSEL(false);
    } catch (err) {
      setError('Failed to update SEL scores');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error || "Student not found"}</p>
          <Link to="/teacher" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Profile</h1>
        <Link 
          to="/teacher" 
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Student info */}
        <div className="md:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                {student.name}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Student details and assessment information
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{student.name}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Class</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{student.class || 'Unassigned'}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Age</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{student.age || 'Not specified'}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Average Literacy Score</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{calculateLiteracyAvg()}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* SEL Scores Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h2 className="text-lg leading-6 font-medium text-gray-900">SEL Competencies</h2>
              <button 
                onClick={() => setEditingSEL(true)}
                className="px-3 py-1 border border-blue-300 rounded-md text-sm text-blue-600 hover:bg-blue-50"
              >
                Update Scores
              </button>
            </div>
            <div className="border-t border-gray-200">
              {editingSEL ? (
                <form onSubmit={handleUpdateSEL} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Empathy input */}
                    <div>
                      <label htmlFor="empathy" className="block text-sm font-medium text-gray-700 mb-1">
                        Empathy
                      </label>
                      <select
                        id="empathy"
                        value={selForm.empathy || ''}
                        onChange={(e) => setSelForm({...selForm, empathy: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Not rated</option>
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Regulation input */}
                    <div>
                      <label htmlFor="regulation" className="block text-sm font-medium text-gray-700 mb-1">
                        Self-Regulation
                      </label>
                      <select
                        id="regulation"
                        value={selForm.regulation || ''}
                        onChange={(e) => setSelForm({...selForm, regulation: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Not rated</option>
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Cooperation input */}
                    <div>
                      <label htmlFor="cooperation" className="block text-sm font-medium text-gray-700 mb-1">
                        Cooperation
                      </label>
                      <select
                        id="cooperation"
                        value={selForm.cooperation || ''}
                        onChange={(e) => setSelForm({...selForm, cooperation: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Not rated</option>
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  

                  <div className="mt-4 flex justify-end space-x-2">
                    <button 
                      type="button"
                      onClick={() => setEditingSEL(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm text-white hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Empathy</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {student.selScores?.empathy || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Self-Regulation</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {student.selScores?.regulation || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Cooperation</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {student.selScores?.cooperation || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Literacy Scores Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Literacy Scores</h2>
            </div>
            <div className="border-t border-gray-200">
              {student.literacyScores && student.literacyScores.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {student.literacyScores.map((score, index) => (
                    <li key={index} className="px-4 py-3 flex justify-between items-center">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Score: {score.score}</span>
                        <span className="ml-2 text-gray-500">
                          {new Date(score.date).toLocaleDateString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-5 text-sm text-gray-500">No literacy scores recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Reflections and AI */}
        <div className="md:col-span-1">
          {/* AI Suggestion Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">AI Teaching Suggestions</h2>
            </div>
            <div className="border-t border-gray-200 p-4">
              {aiSuggestion ? (
                <div className="prose prose-sm max-w-none text-gray-700">
                  {aiSuggestion.split("\n").map((paragraph, i) => (
                    <p key={i} className="mb-2">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-3">
                    Get AI-powered teaching suggestions based on this student's data.
                  </p>
                  <button
                    onClick={handleGetAISuggestion}
                    disabled={loadingSuggestion}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300"
                  >
                    {loadingSuggestion ? 'Loading...' : 'Get Suggestions'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reflections Section - Main focus for teachers */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Teacher Reflections</h2>
              <span className="text-xs text-gray-500">
                {student.reflections?.length || 0} entries
              </span>
            </div>
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleAddReflection} className="mb-6">
                <label htmlFor="reflection" className="block text-sm font-medium text-gray-700 mb-1">
                  Add a new reflection
                </label>
                <textarea
                  id="reflection"
                  rows="3"
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Record your observations about the student's progress..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                ></textarea>
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!reflection.trim() || submittingReflection}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      !reflection.trim() || submittingReflection 
                        ? 'bg-blue-300' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {submittingReflection ? 'Adding...' : 'Add Reflection'}
                  </button>
                </div>
              </form>

              {student.reflections && student.reflections.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {student.reflections.slice().reverse().map((reflection, index) => (
                    <li key={index} className="py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900">{reflection.note}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(reflection.date).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No reflections yet. Add your first observation.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;