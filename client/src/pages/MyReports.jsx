import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Eye, 
  Trash2, 
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import reportService from '../services/reports';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [currentPage, statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      const data = await reportService.getUserReports(params);
      setReports(data.reports || []);
      setTotalPages(data.totalPages || 1);
      setTotalReports(data.total || 0);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReports();
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      return;
    }
    
    try {
      setDeleteLoading(reportId);
      await reportService.deleteReport(reportId);
      toast.success('Laporan berhasil dihapus');
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Gagal menghapus laporan');
    } finally {
      setDeleteLoading(null);
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
      in_progress: 'badge badge-warning',
      working: 'badge badge-warning',
      completed: 'badge badge-success',
    };
    
    const labels = {
      pending: 'Menunggu Verifikasi',
      verified: 'Diverifikasi',
      rejected: 'Ditolak',
      in_progress: 'Sedang Diproses',
      working: 'Sedang Dikerjakan',
      completed: 'Selesai',
    };
    
    return (
      <span className={badges[status] || 'badge badge-secondary'}>
        {labels[status] || status}
      </span>
    );
  };

  const getStatusCount = (status) => {
    return reports.filter(report => report.status === status).length;
  };

  if (loading && currentPage === 1) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Memuat laporan..." />
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
              Laporan Saya
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Total {totalReports} laporan
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/reports/new"
              className="btn btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Buat Laporan Baru
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600">{getStatusCount('pending')}</div>
              <div className="text-sm text-gray-500">Menunggu</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">{getStatusCount('verified')}</div>
              <div className="text-sm text-gray-500">Diverifikasi</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-danger-600">{getStatusCount('rejected')}</div>
              <div className="text-sm text-gray-500">Ditolak</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari laporan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </form>
            
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="input"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu Verifikasi</option>
                <option value="verified">Diverifikasi</option>
                <option value="rejected">Ditolak</option>
                <option value="in_progress">Sedang Diproses</option>
                <option value="working">Sedang Dikerjakan</option>
                <option value="completed">Selesai</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="card">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || statusFilter !== 'all' ? 'Tidak ada laporan yang sesuai' : 'Belum ada laporan'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Mulai buat laporan kerusakan jalan pertama Anda'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
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
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    {report.photoUrl && (
                      <img
                        src={reportService.getImageUrl(report.photoUrl)}
                        alt="Report"
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Content */}
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
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="flex-shrink-0">
                    {getStatusBadge(report.status)}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    <Link
                      to={`/reports/${report._id}`}
                      className="btn btn-secondary btn-sm inline-flex items-center"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Detail
                    </Link>
                    <button
                      onClick={() => handleDelete(report._id)}
                      disabled={deleteLoading === report._id}
                      className="btn btn-danger btn-sm inline-flex items-center"
                    >
                      {deleteLoading === report._id ? (
                        <div className="h-3 w-3 mr-1 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3 mr-1" />
                      )}
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="btn btn-secondary btn-sm"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
                className="btn btn-secondary btn-sm"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyReports;