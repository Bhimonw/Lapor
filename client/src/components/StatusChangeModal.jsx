import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import reportService from '../services/reports';

const StatusChangeModal = ({ isOpen, onClose, report, onStatusChanged }) => {
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusLabels = {
    pending: 'Menunggu Verifikasi',
    verified: 'Diverifikasi', 
    rejected: 'Ditolak',
    in_progress: 'Sedang Ditangani',
    working: 'Sedang Dikerjakan',
    completed: 'Selesai'
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      setAttachmentFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newStatus) {
      toast.error('Pilih status baru');
      return;
    }

    try {
      setLoading(true);
      
      // Debug logging
      console.log('=== STATUS CHANGE MODAL SUBMIT ===');
      console.log('Report ID:', report._id);
      console.log('Current Status:', report.status);
      console.log('New Status:', newStatus);
      console.log('Note:', note);
      console.log('Attachment File:', attachmentFile);
      
      const formData = new FormData();
      formData.append('status', newStatus);
      if (note.trim()) {
        formData.append('note', note.trim());
      }
      if (attachmentFile) {
        formData.append('attachment', attachmentFile);
      }
      
      // Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await reportService.verifyReportWithFile(report._id, formData);
      
      toast.success(`Status laporan berhasil diubah menjadi ${statusLabels[newStatus]}`);
      onStatusChanged();
      handleClose();
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Gagal mengubah status laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewStatus('');
    setNote('');
    setAttachmentFile(null);
    onClose();
  };

  if (!isOpen || !report) return null;

  const nextStatusOptions = {
    pending: ['verified', 'rejected'],
    verified: ['in_progress'],
    in_progress: ['working'],
    working: ['completed'],
    completed: [],
    rejected: []
  };

  const availableStatuses = nextStatusOptions[report.status] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Ubah Status Laporan
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Saat Ini
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-sm">
              {statusLabels[report.status]}
            </div>
          </div>

          {/* New Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Baru *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Status Baru</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tambahkan catatan (opsional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {note.length}/500 karakter
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lampiran Bukti (Opsional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                id="attachment-upload"
              />
              <label
                htmlFor="attachment-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Klik untuk upload file
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Maksimal 5MB (Gambar, PDF, DOC)
                </span>
              </label>
              
              {attachmentFile && (
                <div className="mt-3 flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700 truncate">
                      {attachmentFile.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachmentFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !newStatus}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Ubah Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusChangeModal;