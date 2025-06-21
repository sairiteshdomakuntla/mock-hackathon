import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    teacherCount: '-',
    studentCount: '-',
    recentUploads: '-'
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setStats(response.data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user.token]);
  
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <p className="text-lg text-gray-600 mb-4">Welcome, {user?.name}! You are logged in as an administrator.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Management</h2>
          <ul className="space-y-3">
            <li>
              <Link to="/admin/upload-csv" className="text-blue-600 hover:text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Upload Student CSV Data
              </Link>
            </li>
            <li>
              <Link to="/admin/upload-history" className="text-blue-600 hover:text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                View Upload History
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Management</h2>
          <ul className="space-y-3">
            <li>
              <Link to="/admin/manage-users" className="text-blue-600 hover:text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Manage Users
              </Link>
            </li>
            <li>
              <Link to="/admin/system-settings" className="text-blue-600 hover:text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                System Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Total Teachers</h3>
            <p className="mt-1 text-3xl font-semibold text-blue-600">{loading ? '...' : stats.teacherCount}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Total Students</h3>
            <p className="mt-1 text-3xl font-semibold text-green-600">{loading ? '...' : stats.studentCount}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Recent Uploads</h3>
            <p className="mt-1 text-3xl font-semibold text-purple-600">{loading ? '...' : stats.recentUploads}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;