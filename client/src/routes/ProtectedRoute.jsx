import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (role && user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white shadow-md rounded-lg">
          <h2 className="text-red-600 text-xl font-semibold">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You don't have permission to access this page.
          </p>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
