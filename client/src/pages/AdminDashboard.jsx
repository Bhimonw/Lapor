import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Wrench, 
  CheckCircle2,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalReports: 0,
    statusBreakdown: [],
    recentReports: []
  });
  const [loading, setLoading] = useState(true);

  const statusConfig = {
    pending: {
      label: 'Menunggu Verifikasi',
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200'
    },
    verified: {
      label: 'Terverifikasi',
      icon: CheckCircle,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    rejected: {
      label: 'Ditolak',
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    },
    in_progress: {
      label: 'Sedang Diproses',
      icon: Settings,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    },
    working: {
      label: 'Sedang Dikerjakan',
      icon: Wrench,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200'
    },
    completed: {
      label: 'Selesai',
      icon: CheckCircle2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/reports/dashboard/stats',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Gagal memuat statistik dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status) => {
    const statusData = stats.statusBreakdown.find(item => item._id === status);
    return statusData ? statusData.count : 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="mt-2 text-gray-600">
            Kelola dan pantau semua laporan kerusakan jalan
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Laporan</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalReports}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Selesai</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {getStatusCount('completed')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Menunggu</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {getStatusCount('pending')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Dikerjakan</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {getStatusCount('working')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Laporan Berdasarkan Status
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const count = getStatusCount(status);
                  const percentage = stats.totalReports > 0 
                    ? ((count / stats.totalReports) * 100).toFixed(1)
                    : 0;
                  const IconComponent = config.icon;

                  return (
                    <div
                      key={status}
                      className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                        config.bgColor
                      } ${config.borderColor}`}
                      onClick={() => navigate(`/admin/reports/status/${status}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${config.color}`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${config.textColor}`}>
                              {config.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {percentage}% dari total
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${config.textColor}`}>
                            {count}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Laporan Terbaru
              </h3>
            </div>
            <div className="p-6">
              {stats.recentReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada laporan terbaru</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentReports.map((report) => {
                    const config = statusConfig[report.status];
                    const IconComponent = config.icon;

                    return (
                      <div
                        key={report._id}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/admin/reports/${report._id}`)}
                      >
                        <img
                          src={`http://localhost:5000${report.photoUrl}`}
                          alt="Foto laporan"
                          className="h-12 w-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {report.description}
                          </p>
                          <div className="flex items-center mt-1">
                            <Users className="h-3 w-3 text-gray-400 mr-1" />
                            <p className="text-xs text-gray-500">
                              {report.user.name}
                            </p>
                          </div>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <p className="text-xs text-gray-500">
                              {formatDate(report.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            config.bgColor
                          } ${config.textColor}`}>
                            <IconComponent className="h-3 w-3 mr-1" />
                            {config.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Aksi Cepat
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/admin/reports')}
                className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
              >
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900">Semua Laporan</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Lihat dan kelola semua laporan
                </p>
              </button>

              <button
                onClick={() => navigate('/admin/reports/status/pending')}
                className="p-4 text-left border border-gray-200 rounded-lg hover:border-yellow-300 hover:shadow-md transition-all"
              >
                <Clock className="h-8 w-8 text-yellow-600 mb-2" />
                <h4 className="font-medium text-gray-900">Verifikasi Laporan</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Verifikasi laporan yang masuk
                </p>
              </button>

              <button
                onClick={() => navigate('/admin/users')}
                className="p-4 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all"
              >
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900">Kelola Pengguna</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola akun pengguna sistem
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;