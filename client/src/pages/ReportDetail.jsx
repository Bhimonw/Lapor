import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Check, 
  X, 
  Clock,
  Trash2,
  ExternalLink,
  History
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ReportStatusHistory from '../components/ReportStatusHistory';
import { useAuth } from '../hooks/useAuth.jsx';
import reportService from '../services/reports';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReport(id);
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Gagal memuat detail laporan');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReport = async (action) => {
    const actionText = action === 'verified' ? 'memverifikasi' : 'menolak';
    
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} laporan ini?`)) {
      return;
    }
    
    try {
      setActionLoading(true);
      await reportService.verifyReport(id, { status: action });
      toast.success(`Laporan berhasil ${action === 'verified' ? 'diverifikasi' : 'ditolak'}`);
      fetchReport(); // Refresh data
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error(`Gagal ${actionText} laporan`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      return;
    }
    
    try {
      setDeleteLoading(true);
      await reportService.deleteReport(id);
      toast.success('Laporan berhasil dihapus');
      navigate(isAdmin() ? '/admin/reports' : '/reports/my');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Gagal menghapus laporan');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
      pending: 'Menunggu Verifikasi',
      verified: 'Diverifikasi',
      rejected: 'Ditolak',
    };
    
    return (
      <span className={badges[status]}>
        {labels[status]}
      </span>
    );
  };

  const openInMaps = () => {
    if (report?.latitude && report?.longitude) {
      const url = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
      window.open(url, '_blank');
    }
  };

  const canEdit = () => {
    return isAdmin() || (user && report?.user?._id === user.id);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Memuat detail laporan..." />
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Laporan tidak ditemukan</h3>
          <p className="mt-1 text-sm text-gray-500">Laporan yang Anda cari tidak ada atau telah dihapus.</p>
          <div className="mt-6">
            <Link to="/dashboard" className="btn btn-primary">
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </button>
          
          <div className="flex items-center space-x-3">
            {getStatusBadge(report.status)}
            
            {/* Admin Actions */}
            {isAdmin() && report.status === 'pending' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVerifyReport('verified')}
                  disabled={actionLoading}
                  className="btn btn-success btn-sm inline-flex items-center"
                >
                  {actionLoading ? (
                    <div className="h-4 w-4 mr-2 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Verifikasi
                </button>
                <button
                  onClick={() => handleVerifyReport('rejected')}
                  disabled={actionLoading}
                  className="btn btn-danger btn-sm inline-flex items-center"
                >
                  {actionLoading ? (
                    <div className="h-4 w-4 mr-2 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Tolak
                </button>
              </div>
            )}
            
            {/* Reset Action for Admin */}
            {isAdmin() && report.status !== 'pending' && (
              <button
                onClick={() => handleVerifyReport('pending')}
                disabled={actionLoading}
                className="btn btn-warning btn-sm inline-flex items-center"
              >
                {actionLoading ? (
                  <div className="h-4 w-4 mr-2 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Clock className="h-4 w-4 mr-2" />
                )}
                Reset Status
              </button>
            )}
            
            {/* Delete Action */}
            {canEdit() && (
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="btn btn-danger btn-sm inline-flex items-center"
              >
                {deleteLoading ? (
                  <div className="h-4 w-4 mr-2 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Photo */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Foto Kerusakan</h2>
            {report.photoUrl ? (
              <div className="relative">
                <img
                  src={reportService.getImageUrl(report.photoUrl)}
                  alt="Report Photo"
                  className="w-full h-64 sm:h-80 object-cover rounded-lg"
                />
                <button
                  onClick={() => window.open(reportService.getImageUrl(report.photoUrl), '_blank')}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-opacity"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <p className="text-gray-500">Tidak ada foto</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Description */}
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Deskripsi Kerusakan</h2>
              <p className="text-gray-700 leading-relaxed">{report.description}</p>
            </div>

            {/* Location */}
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Lokasi</h2>
              <div className="space-y-3">
                {report.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Alamat</p>
                      <p className="text-sm text-gray-600">{report.address}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Koordinat</p>
                    <p className="text-sm text-gray-600">
                      {report.latitude?.toFixed(6)}, {report.longitude?.toFixed(6)}
                    </p>
                  </div>
                </div>
                
                {report.latitude && report.longitude && (
                  <button
                    onClick={openInMaps}
                    className="btn btn-secondary btn-sm inline-flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Buka di Google Maps
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Report Information */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Laporan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Reporter */}
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Pelapor</p>
                <p className="text-sm text-gray-600">
                  {report.user?.name || 'Pengguna tidak diketahui'}
                </p>
                {report.user?.email && (
                  <p className="text-xs text-gray-500">{report.user.email}</p>
                )}
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Tanggal Dibuat</p>
                <p className="text-sm text-gray-600">{formatDate(report.createdAt)}</p>
              </div>
            </div>

            {/* Verified By */}
            {report.verifiedBy && (
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Diverifikasi Oleh</p>
                  <p className="text-sm text-gray-600">{report.verifiedBy.name}</p>
                  {report.updatedAt && report.updatedAt !== report.createdAt && (
                    <p className="text-xs text-gray-500">
                      {formatDate(report.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status History */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Riwayat Status</h2>
            <button
              onClick={() => setHistoryModalOpen(true)}
              className="btn btn-secondary btn-sm inline-flex items-center"
            >
              <History className="h-4 w-4 mr-2" />
              Lihat Riwayat Lengkap
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Laporan dibuat</p>
                <p className="text-xs text-gray-500">{formatDate(report.createdAt)}</p>
              </div>
            </div>
            
            {report.status !== 'pending' && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`h-2 w-2 rounded-full ${
                    report.status === 'verified' ? 'bg-green-600' : 'bg-red-600'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Laporan {report.status === 'verified' ? 'diverifikasi' : 'ditolak'}
                    {report.verifiedBy && ` oleh ${report.verifiedBy.name}`}
                  </p>
                  {report.updatedAt && (
                    <p className="text-xs text-gray-500">{formatDate(report.updatedAt)}</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Klik "Lihat Riwayat Lengkap" untuk melihat seluruh proses termasuk lampiran bukti
              </p>
            </div>
          </div>
        </div>
        
        {/* Status History Modal */}
        <ReportStatusHistory
          reportId={id}
          isOpen={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default ReportDetail;