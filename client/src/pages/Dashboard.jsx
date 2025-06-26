import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import reportService from '../services/reports';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch reports based on user role
      const reportsData = isAdmin() 
        ? await reportService.getAllReports({ limit: 5 })
        : await reportService.getUserReports({ limit: 5 });
      
      const reports = reportsData.reports || [];
      setRecentReports(reports);
      
      // Calculate statistics
      const statsData = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        verified: reports.filter(r => r.status === 'verified').length,
        rejected: reports.filter(r => r.status === 'rejected').length,
      };
      
      // If admin, fetch all reports for accurate stats
      if (isAdmin()) {
        const allReports = await reportService.getAllReports({ limit: 1000 });
        const allReportsData = allReports.reports || [];
        
        statsData.total = allReportsData.length;
        statsData.pending = allReportsData.filter(r => r.status === 'pending').length;
        statsData.verified = allReportsData.filter(r => r.status === 'verified').length;
        statsData.rejected = allReportsData.filter(r => r.status === 'rejected').length;
      }
      
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge badge-pending',
      verified: 'badge badge-verified',
      rejected: 'badge badge-rejected',
    };
    
    const labels = {
      pending: 'Menunggu',
      verified: 'Diverifikasi',
      rejected: 'Ditolak',
    };
    
    return (
      <span className={badges[status]}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Memuat dashboard..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Selamat datang, {user?.name}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isAdmin() ? 'Dashboard Admin' : 'Dashboard Pengguna'}
            </p>
          </div>
          {!isAdmin() && (
            <div className="mt-4 sm:mt-0">
              <Link
                to="/reports/new"
                className="btn btn-primary inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat Laporan
              </Link>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Laporan
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Menunggu Verifikasi
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pending}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Diverifikasi
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.verified}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-danger-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ditolak
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.rejected}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              {isAdmin() ? 'Laporan Terbaru' : 'Laporan Saya Terbaru'}
            </h2>
            <Link
              to={isAdmin() ? '/admin/reports' : '/reports/my'}
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              Lihat semua
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Belum ada laporan
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isAdmin() 
                  ? 'Belum ada laporan yang masuk ke sistem.'
                  : 'Anda belum membuat laporan apapun.'
                }
              </p>
              {!isAdmin() && (
                <div className="mt-6">
                  <Link
                    to="/reports/new"
                    className="btn btn-primary inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Laporan Pertama
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report._id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {report.photoUrl && (
                      <img
                        src={reportService.getImageUrl(report.photoUrl)}
                        alt="Report"
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {report.description}
                    </p>
                    <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {report.address || `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(report.createdAt)}
                      </div>
                      {isAdmin() && report.user && (
                        <div>
                          Oleh: {report.user.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(report.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {!isAdmin() && (
            <Link
              to="/reports/new"
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Plus className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Buat Laporan Baru
                  </h3>
                  <p className="text-sm text-gray-500">
                    Laporkan kerusakan jalan dengan foto dan lokasi
                  </p>
                </div>
              </div>
            </Link>
          )}

          <Link
            to={isAdmin() ? '/admin/reports' : '/reports/my'}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isAdmin() ? 'Kelola Laporan' : 'Lihat Laporan Saya'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isAdmin() 
                    ? 'Verifikasi dan kelola semua laporan'
                    : 'Lihat status dan detail laporan Anda'
                  }
                </p>
              </div>
            </div>
          </Link>

          {isAdmin() && (
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Statistik
                  </h3>
                  <p className="text-sm text-gray-500">
                    Tingkat verifikasi: {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;