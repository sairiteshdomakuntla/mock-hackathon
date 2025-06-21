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

  // Calculates the average literacy score
  const calculateLiteracyAvg = () => {
    if (!student?.literacyScores || student.literacyScores.length === 0) {
      return 'N/A';
    }
    
    const sum = student.literacyScores.reduce((acc, score) => acc + (score.score || 0), 0);
    return (sum / student.literacyScores.length).toFixed(1);
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
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">SEL Competencies</h2>
        </div>
        <div className="border-t border-gray-200">
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
        </div>
      </div>

      {/* Literacy Scores Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Literacy Scores</h2>
          <button className="px-3 py-1 border border-blue-300 rounded-md text-sm text-blue-600 hover:bg-blue-50">
            Add Score
          </button>
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

      {/* Reflections Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Teacher Reflections</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Add notes and observations about the student's progress
          </p>
        </div>
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleAddReflection} className="mb-6">
            <textarea
              rows="3"
              className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
              placeholder="Add a new reflection..."
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
              {student.reflections.map((reflection, index) => (
                <li key={index} className="py-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900">{reflection.note}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(reflection.date).toLocaleString()}
                    </p>
                  </div>
                </li>
              )).reverse()}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No reflections yet. Add your first observation.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;