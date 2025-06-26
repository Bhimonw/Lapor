import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateReport from './pages/CreateReport';
import MyReports from './pages/MyReports';
import ManageReports from './pages/ManageReports';
import ReportDetail from './pages/ReportDetail';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/reports/new" element={
            <ProtectedRoute>
              <CreateReport />
            </ProtectedRoute>
          } />
          
          <Route path="/reports/my" element={
            <ProtectedRoute>
              <MyReports />
            </ProtectedRoute>
          } />
          
          <Route path="/reports/:id" element={
            <ProtectedRoute>
              <ReportDetail />
            </ProtectedRoute>
          } />
          
          {/* Admin Only Routes */}
          <Route path="/admin/reports" element={
            <ProtectedRoute adminOnly>
              <ManageReports />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-6">Halaman yang Anda cari tidak ditemukan.</p>
                <a href="/dashboard" className="btn btn-primary">
                  Kembali ke Dashboard
                </a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;