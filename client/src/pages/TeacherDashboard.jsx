import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js';

// Register Chart.js components
Chart.register(
  ArcElement,
  CategoryScale, 
  LinearScale, 
  BarElement
);

const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageLiteracy: 0,
    reflectionsCount: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/students', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setStudents(response.data);
        
        // Calculate stats
        const total = response.data.length;
        
        // Calculate average literacy score
        let literacySum = 0;
        let literacyCount = 0;
        
        // Count total reflections
        let reflectionsTotal = 0;
        
        response.data.forEach(student => {
          // Add up literacy scores
          if (student.literacyScores && student.literacyScores.length > 0) {
            literacySum += student.literacyScores.reduce((sum, score) => sum + score.score, 0);
            literacyCount += student.literacyScores.length;
          }
          
          // Count reflections
          if (student.reflections) {
            reflectionsTotal += student.reflections.length;
          }
        });
        
        setStats({
          totalStudents: total,
          averageLiteracy: literacyCount > 0 ? (literacySum / literacyCount).toFixed(1) : 'N/A',
          reflectionsCount: reflectionsTotal
        });
        
      } catch (err) {
        setError('Failed to load students');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user.token]);

  // Prepare distribution data for class distribution chart
  const prepareClassDistributionData = () => {
    if (!students.length) return null;
    
    const classCount = {};
    students.forEach(student => {
      const className = student.class || 'Unassigned';
      classCount[className] = (classCount[className] || 0) + 1;
    });
    
    return {
      labels: Object.keys(classCount),
      datasets: [
        {
          data: Object.values(classCount),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
          ],
          borderWidth: 1
        }
      ]
    };
  };

  // Determine if there are students who need attention (no recent reflections or low literacy)
  const getStudentsNeedingAttention = () => {
    if (!students.length) return [];
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    return students.filter(student => {
      // No reflections in the last 2 weeks
      const hasRecentReflection = student.reflections && student.reflections.some(
        r => new Date(r.date) > twoWeeksAgo
      );
      
      // Low literacy score (below 70)
      const hasLowLiteracy = student.literacyScores && student.literacyScores.length > 0 && 
        student.literacyScores.sort((a, b) => new Date(b.date) - new Date(a.date))[0].score < 70;
      
      return !hasRecentReflection || hasLowLiteracy;
    });
  };
  
  const classDistributionData = prepareClassDistributionData();
  const studentsNeedingAttention = getStudentsNeedingAttention();

  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
        <p className="text-sm text-gray-600 mt-2">
          View your assigned students and track their progress.
        </p>
      </div>

      {/* Stats Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Students</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {loading ? '...' : stats.totalStudents}
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Literacy</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {loading ? '...' : stats.averageLiteracy}
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Reflections</h3>
          <p className="mt-2 text-3xl font-semibold text-purple-600">
            {loading ? '...' : stats.reflectionsCount}
          </p>
        </div>
      </div>

      {/* Class Distribution Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Class Distribution</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : classDistributionData ? (
            <div className="h-64">
              <Doughnut
                data={classDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No class data available</p>
          )}
        </div>

        {/* Students Needing Attention */}
        <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Students Needing Attention</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : studentsNeedingAttention.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsNeedingAttention.slice(0, 5).map(student => {
                    // Determine reason for attention
                    const twoWeeksAgo = new Date();
                    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                    
                    const hasRecentReflection = student.reflections && student.reflections.some(
                      r => new Date(r.date) > twoWeeksAgo
                    );
                    
                    const hasLowLiteracy = student.literacyScores && student.literacyScores.length > 0 && 
                      student.literacyScores.sort((a, b) => new Date(b.date) - new Date(a.date))[0].score < 70;
                    
                    let reason = [];
                    if (!hasRecentReflection) reason.push("No recent reflection");
                    if (hasLowLiteracy) reason.push("Low literacy score");
                    
                    return (
                      <tr key={student._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.class || 'Unassigned'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-red-600">{reason.join(", ")}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link 
                            to={`/teacher/student/${student._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {studentsNeedingAttention.length > 5 && (
                <div className="mt-2 text-right">
                  <span className="text-sm text-gray-500">
                    +{studentsNeedingAttention.length - 5} more students need attention
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-green-600">All students are on track!</p>
              <p className="text-sm text-gray-500 mt-2">No students currently need special attention.</p>
            </div>
          )}
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Students</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No students have been assigned to you yet.</p>
              <p className="text-gray-500 text-sm mt-2">
                Students are added by administrators. Please contact an admin if you need students added to your roster.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Literacy Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Reflection
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map(student => {
                    // Calculate average literacy score if available
                    const literacyAvg = student.literacyScores && student.literacyScores.length
                      ? student.literacyScores.reduce((sum, score) => sum + (score.score || 0), 0) / 
                        student.literacyScores.length
                      : 'N/A';
                    
                    // Get the most recent reflection
                    const lastReflection = student.reflections && student.reflections.length > 0
                      ? student.reflections.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                      : null;
                    
                    return (
                      <tr key={student._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.class || 'Unassigned'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.age || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {typeof literacyAvg === 'number' 
                              ? literacyAvg.toFixed(1) 
                              : literacyAvg}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {lastReflection 
                              ? <span title={lastReflection.note}>
                                  {new Date(lastReflection.date).toLocaleDateString()}
                                </span>
                              : 'No reflections'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link 
                            to={`/teacher/student/${student._id}`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
