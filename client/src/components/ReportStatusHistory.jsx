import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Wrench, 
  CheckCircle2,
  User,
  Calendar,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const ReportStatusHistory = ({ reportId, isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

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
    if (isOpen && reportId) {
      fetchStatusHistory();
    }
  }, [isOpen, reportId]);

  const fetchStatusHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/reports/${reportId}/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching status history:', error);
      toast.error('Gagal memuat riwayat status');
    } finally {
      setLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Riwayat Status Laporan
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Memuat riwayat...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada riwayat perubahan status</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => {
                const config = statusConfig[item.status];
                const IconComponent = config?.icon || Clock;
                const isLatest = index === 0;

                return (
                  <div key={index} className="relative">
                    {/* Timeline line */}
                    {index < history.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                    )}

                    <div className={`flex items-start space-x-4 p-4 rounded-lg border ${
                      isLatest ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      {/* Status Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-full ${
                        config?.color || 'bg-gray-500'
                      }`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`text-sm font-semibold ${
                            config?.textColor || 'text-gray-700'
                          }`}>
                            {config?.label || item.status}
                          </h4>
                          {isLatest && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Status Saat Ini
                            </span>
                          )}
                        </div>

                        {/* Changed by */}
                        {item.changedBy && (
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <User className="h-4 w-4 mr-1" />
                            <span>Diubah oleh: {item.changedBy.name}</span>
                          </div>
                        )}

                        {/* Date */}
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(item.timestamp)}</span>
                        </div>

                        {/* Note */}
                        {item.note && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-start">
                              <MessageSquare className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Catatan:</p>
                                <p className="text-sm text-gray-700">{item.note}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Arrow between items */}
                    {index < history.length - 1 && (
                      <div className="flex justify-center my-2">
                        <ArrowRight className="h-4 w-4 text-gray-400 transform rotate-90" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportStatusHistory;