import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Calendar, User, MessageSquare, Eye, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const ReportsByStatus = () => {
  const { status } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const statusLabels = {
    pending: 'Menunggu Verifikasi',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
    in_progress: 'Sedang Diproses',
    working: 'Sedang Dikerjakan',
    completed: 'Selesai'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    in_progress: 'bg-purple-100 text-purple-800',
    working: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800'
  };

  const nextStatusOptions = {
    pending: ['verified', 'rejected'],
    verified: ['in_progress', 'rejected'],
    in_progress: ['working', 'rejected'],
    working: ['completed', 'rejected'],
    completed: [],
    rejected: []
  };

  useEffect(() => {
    fetchReports();
  }, [status, currentPage]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/reports/status/${status}?page=${currentPage}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setReports(response.data.data.reports);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedReport || !newStatus) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:3000/api/reports/${selectedReport._id}/verify`,
        {
          status: newStatus,
          note: statusNote
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(`Status laporan berhasil diubah ke ${statusLabels[newStatus]}`);
        setShowStatusModal(false);
        setSelectedReport(null);
        setNewStatus('');
        setStatusNote('');
        fetchReports(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Gagal mengubah status laporan');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
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
          <p className="mt-4 text-gray-600">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/reports')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Kembali ke Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Laporan {statusLabels[status]}
          </h1>
          <p className="mt-2 text-gray-600">
            Menampilkan semua laporan dengan status {statusLabels[status].toLowerCase()}
          </p>
        </div>

        {/* Reports List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak ada laporan
              </h3>
              <p className="text-gray-600">
                Belum ada laporan dengan status {statusLabels[status].toLowerCase()}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Laporan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pelapor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lokasi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <img
                              src={`http://localhost:3000${report.photoUrl}`}
                              alt="Foto laporan"
                              className="h-16 w-16 object-cover rounded-lg mr-4"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                {report.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                ID: {report._id.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {report.user.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {report.user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {report.address || 'Alamat tidak tersedia'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <p className="text-sm text-gray-900">
                              {formatDate(report.createdAt)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            statusColors[report.status]
                          }`}>
                            {statusLabels[report.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/admin/reports/${report._id}`)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {nextStatusOptions[status].length > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setShowStatusModal(true);
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="Ubah Status"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sebelumnya
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Selanjutnya
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Menampilkan{' '}
                        <span className="font-medium">
                          {(currentPage - 1) * 10 + 1}
                        </span>{' '}
                        sampai{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * 10, pagination.totalReports)}
                        </span>{' '}
                        dari{' '}
                        <span className="font-medium">{pagination.totalReports}</span>{' '}
                        hasil
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={!pagination.hasPrevPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Sebelumnya
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          {currentPage} dari {pagination.totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={!pagination.hasNextPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Selanjutnya
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ubah Status Laporan
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Baru
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih status baru</option>
                  {nextStatusOptions[status].map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusLabels[statusOption]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tambahkan catatan untuk perubahan status ini..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedReport(null);
                    setNewStatus('');
                    setStatusNote('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || updating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Mengubah...' : 'Ubah Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsByStatus;