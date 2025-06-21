import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
Chart.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
    empathy: '',
    regulation: '',
    cooperation: ''
  });
  const [newScore, setNewScore] = useState('');
  const [addingScore, setAddingScore] = useState(false);
  const [geminiAvailable, setGeminiAvailable] = useState(true); // Optimistically assume it's available
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
        
        // Initialize SEL form with current values
        if (response.data.selScores) {
          setSelForm({
            empathy: response.data.selScores.empathy || '',
            regulation: response.data.selScores.regulation || '',
            cooperation: response.data.selScores.cooperation || ''
          });
        }
      } catch (err) {
        setError('Failed to load student data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, user.token]);

  useEffect(() => {
    const checkGeminiAvailability = async () => {
      try {
        await axios.get('http://localhost:5000/api/gemini/status', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setGeminiAvailable(true);
      } catch (err) {
        if (err.response && err.response.status === 503) {
          setGeminiAvailable(false);
        }
      }
    };
    
    checkGeminiAvailability();
  }, [user.token]);

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

  // Update the handleGetAISuggestion function to send more data
  const handleGetAISuggestion = async () => {
    setLoadingSuggestion(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/gemini/suggestion',
        {
          name: student.name,
          literacyScores: student.literacyScores || [],
          selScores: student.selScores || {},
          reflections: student.reflections || []
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

  const handleAddLiteracyScore = async (e) => {
    e.preventDefault();
    if (!newScore) return;

    setAddingScore(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/students/${id}/literacy-score`,
        { score: parseFloat(newScore) },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      
      // Update student with new literacy scores
      setStudent({
        ...student,
        literacyScores: response.data.literacyScores
      });
      
      // Clear form
      setNewScore('');
      setAddingScore(false);
    } catch (err) {
      setError('Failed to add literacy score');
      console.error(err);
    } finally {
      setAddingScore(false);
    }
  };

  // Prepare chart data for literacy scores
  const prepareLiteracyChartData = () => {
    if (!student?.literacyScores || student.literacyScores.length === 0) {
      return null;
    }

    // Sort scores by date
    const sortedScores = [...student.literacyScores].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return {
      labels: sortedScores.map(score => 
        new Date(score.date).toLocaleDateString()
      ),
      datasets: [
        {
          label: 'Literacy Score',
          data: sortedScores.map(score => score.score),
          fill: false,
          backgroundColor: 'rgb(59, 130, 246)',
          borderColor: 'rgba(59, 130, 246, 0.5)',
        }
      ]
    };
  };

  // Prepare chart data for SEL scores
  const prepareSELChartData = () => {
    if (!student?.selScores) {
      return null;
    }

    return {
      labels: ['Empathy', 'Self-Regulation', 'Cooperation'],
      datasets: [
        {
          label: 'SEL Competencies',
          data: [
            student.selScores.empathy || 0,
            student.selScores.regulation || 0,
            student.selScores.cooperation || 0
          ],
          backgroundColor: [
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)'
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const literacyChartData = student ? prepareLiteracyChartData() : null;
  const selChartData = student ? prepareSELChartData() : null;

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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    {student.name}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Student details and assessment information
                  </p>
                </div>
                {(student.literacyScores?.length > 0 || student.reflections?.length > 0) && (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    AI Ready
                  </span>
                )}
              </div>
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

          {/* Literacy Score Chart */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Literacy Progress</h2>
            </div>
            <div className="border-t border-gray-200 p-4">
              {literacyChartData ? (
                <div style={{ height: "300px" }}>
                  <Line 
                    data={literacyChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: false,
                          title: {
                            display: true,
                            text: 'Score'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Date'
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">
                  No literacy data available to display chart.
                </p>
              )}
            </div>
          </div>

          {/* SEL Chart */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h2 className="text-lg leading-6 font-medium text-gray-900">SEL Competencies</h2>
              <button
                onClick={() => setEditingSEL(!editingSEL)} 
                className="px-3 py-1 border border-blue-300 rounded-md text-sm text-blue-600 hover:bg-blue-50"
              >
                {editingSEL ? 'Cancel' : 'Update SEL Scores'}
              </button>
            </div>
            <div className="border-t border-gray-200 p-4">
              {editingSEL ? (
                <form onSubmit={handleUpdateSEL} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Empathy input */}
                    <div>
                      <label htmlFor="empathy" className="block text-sm font-medium text-gray-700 mb-1">
                        Empathy
                      </label>
                      <select
                        id="empathy"
                        value={selForm.empathy}
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
                        value={selForm.regulation}
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
                        value={selForm.cooperation}
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
                  
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm text-white hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : selChartData ? (
                <div style={{ height: "300px" }}>
                  <Bar 
                    data={selChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 5,
                          title: {
                            display: true,
                            text: 'Rating (1-5)'
                          }
                        }
                      }
                    }}
                  />
                </div>
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
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Literacy Scores</h2>
              <button 
                onClick={() => setAddingScore(!addingScore)}
                className="px-3 py-1 border border-blue-300 rounded-md text-sm text-blue-600 hover:bg-blue-50"
              >
                {addingScore ? 'Cancel' : 'Add Score'}
              </button>
            </div>
            <div className="border-t border-gray-200">
              {addingScore && (
                <form onSubmit={handleAddLiteracyScore} className="p-4 border-b border-gray-200">
                  <div className="flex items-end space-x-4">
                    <div className="flex-grow">
                      <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
                        New Score
                      </label>
                      <input
                        type="number"
                        id="score"
                        min="0"
                        max="100"
                        step="0.1"
                        value={newScore}
                        onChange={(e) => setNewScore(e.target.value)}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!newScore}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                        !newScore ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Add
                    </button>
                  </div>
                </form>
              )}
              
              {student.literacyScores && student.literacyScores.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {[...student.literacyScores]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((score, index) => (
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
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h2 className="text-lg leading-6 font-medium text-gray-900">AI Teaching Suggestions</h2>
              {aiSuggestion && (
                <button
                  onClick={() => setAiSuggestion('')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Get new suggestion
                </button>
              )}
            </div>
            <div className="border-t border-gray-200 p-4">
              {!geminiAvailable ? (
                <div className="text-center py-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">API Not Configured</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    The Gemini AI API is not configured. Please add your API key to the server environment.
                  </p>
                </div>
              ) : loadingSuggestion ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
                  <p className="text-sm text-gray-500">Generating personalized suggestions...</p>
                </div>
              ) : aiSuggestion ? (
                <div className="prose prose-sm max-w-none text-gray-700">
                  {aiSuggestion.split("\n").map((paragraph, i) => {
                    // Section headers (starts with number and period or has a colon)
                    if (/^\d+\./.test(paragraph.trim()) || /^[A-Z].*:/.test(paragraph.trim())) {
                      return (
                        <h3 key={i} className="text-md font-medium text-purple-800 mt-4 mb-1">
                          {paragraph.trim()}
                        </h3>
                      );
                    }
                    // Bullet points
                    else if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
                      return (
                        <div key={i} className="ml-4 my-1 flex">
                          <span className="mr-2">{paragraph.trim().startsWith('-') ? '•' : ''}</span>
                          <span>{paragraph.trim().replace(/^[-•]\s*/, '')}</span>
                        </div>
                      );
                    }
                    // Regular paragraph with content
                    else if (paragraph.trim()) {
                      return <p key={i} className="mb-2">{paragraph.trim()}</p>;
                    }
                    // Empty line - small spacer
                    return <div key={i} className="h-1"></div>;
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <svg className="mx-auto h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m0 16v1m-9-9h1m16 0h1m-3.4-6.4l.8.8m-8.8.8l-.8-.8m0 8.8l-.8.8m8.8-.8l.8.8" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Get AI-powered teaching insights</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Receive personalized teaching strategies based on {student.name}'s data
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={handleGetAISuggestion}
                      disabled={loadingSuggestion}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300"
                    >
                      Generate Teaching Suggestions
                    </button>
                  </div>
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