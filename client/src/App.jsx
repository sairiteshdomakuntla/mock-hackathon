import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UploadCSV from './pages/UploadCSV';
import ManageUsers from './pages/ManageUsers';
import UploadHistory from './pages/UploadHistory';
import StudentProfile from './pages/StudentProfile';
import AddStudent from './pages/AddStudent';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/upload-csv"
                element={
                  <ProtectedRoute role="admin">
                    <UploadCSV />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/manage-users"
                element={
                  <ProtectedRoute role="admin">
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/upload-history"
                element={
                  <ProtectedRoute role="admin">
                    <UploadHistory />
                  </ProtectedRoute>
                }
              />
              
              {/* Teacher Routes */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute role="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/teacher/add-student"
                element={
                  <ProtectedRoute role="teacher">
                    <AddStudent />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/teacher/student/:id"
                element={
                  <ProtectedRoute role="teacher">
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

// This component decides which dashboard to show based on user role
function DashboardRouter() {
  const { user } = useAuth();
  
  if (user.role === 'admin') {
    return <AdminDashboard />;
  } else {
    return <TeacherDashboard />;
  }
}

export default App;
