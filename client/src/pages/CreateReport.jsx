import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Camera, MapPin, Upload, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import useGeolocation from '../hooks/useGeolocation.jsx';
import reportService from '../services/reports';

const CreateReport = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const {
    getCurrentPosition,
    position,
    setPosition,
    address,
    setAddress,
    loading: locationLoading,
    error: locationError,
    isSupported
  } = useGeolocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const description = watch('description', '');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Hanya file gambar yang diperbolehkan');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    // Reset file input
    const fileInput = document.getElementById('photo');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleGetLocation = async () => {
    try {
      await getCurrentPosition();
      toast.success('Lokasi berhasil didapatkan');
    } catch (error) {
      toast.error('Gagal mendapatkan lokasi: ' + error.message);
    }
  };

  const onSubmit = async (data) => {
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('1. Raw form data from react-hook-form:', data);
    console.log('2. Selected file:', selectedFile);
    console.log('3. Position state:', position);
    console.log('4. Address state:', address);
    console.log('5. Data description:', data.description);
    console.log('6. Data description type:', typeof data.description);
    console.log('7. Data description length:', data.description?.length);
    
    if (!selectedFile) {
      toast.error('Please select a photo');
      return;
    }

    if (!position || !position.latitude || !position.longitude) {
      toast.error('Please enable location access');
      return;
    }

    if (!data.description || data.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    console.log('8. Validation passed, preparing submission data...');
    console.log('9. Final submission data:', {
      description: data.description,
      selectedFile: selectedFile?.name,
      position,
      address
    });

    setIsSubmitting(true);
    
    try {
      console.log('10. Creating FormData...');
      
      const formData = new FormData();
      
      console.log('11. Appending description:', data.description, 'Type:', typeof data.description);
      formData.append('description', data.description);
      
      console.log('12. Appending latitude:', position.latitude, 'Type:', typeof position.latitude);
      formData.append('latitude', position.latitude);
      
      console.log('13. Appending longitude:', position.longitude, 'Type:', typeof position.longitude);
      formData.append('longitude', position.longitude);
      
      console.log('14. Appending photo:', selectedFile, 'Name:', selectedFile?.name);
      formData.append('photo', selectedFile);
      
      if (address) {
        console.log('15. Appending address:', address, 'Type:', typeof address);
        formData.append('address', address);
      }

      // Log FormData entries
      console.log('16. FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`   ${key}:`, value, 'Type:', typeof value);
      }

      // Prepare data object for reportService
      const reportData = {
        description: data.description,
        latitude: position.latitude,
        longitude: position.longitude,
        photo: selectedFile,
        address: address || ''
      };
      
      console.log('17. Sending to reportService:', reportData);
      await reportService.createReport(reportData);
      
      toast.success('Laporan berhasil dibuat!');
      navigate('/reports');
    } catch (error) {
      console.error('Error creating report:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      
      // Show specific error message if available
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Gagal membuat laporan: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(`Gagal membuat laporan: ${error.response.data.message}`);
      } else {
        toast.error('Gagal membuat laporan. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Buat Laporan Kerusakan Jalan
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Laporkan kerusakan jalan dengan foto dan lokasi yang akurat
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Deskripsi Kerusakan *
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                rows={4}
                className={`input ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Jelaskan kondisi kerusakan jalan yang Anda temukan..."
                {...register('description', {
                  required: 'Deskripsi kerusakan wajib diisi',
                  minLength: {
                    value: 10,
                    message: 'Deskripsi minimal 10 karakter'
                  },
                  maxLength: {
                    value: 500,
                    message: 'Deskripsi maksimal 500 karakter'
                  }
                })}
              />
              <div className="flex justify-between mt-1">
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {description.length}/500
                </p>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Foto Kerusakan *
            </label>
            <div className="mt-1">
              {!selectedFile ? (
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="photo"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload foto</span>
                        <input
                          id="photo"
                          name="photo"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">atau drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG hingga 5MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>File: {selectedFile.name}</p>
                    <p>Ukuran: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lokasi Kerusakan *
            </label>
            <div className="mt-1">
              {!isSupported ? (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-700">
                    Browser Anda tidak mendukung geolokasi
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="btn btn-secondary inline-flex items-center"
                  >
                    {locationLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4 mr-2" />
                    )}
                    {locationLoading ? 'Mendapatkan Lokasi...' : 'Dapatkan Lokasi Saya'}
                  </button>
                  
                  {locationError && (
                    <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <p className="text-sm text-red-700">{locationError}</p>
                    </div>
                  )}
                  
                  {/* Manual Coordinate Input */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Atau masukkan koordinat secara manual:</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Contoh: Latitude: -3.453639, Longitude: 114.837887
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Latitude <span className="text-gray-500">(-90 hingga 90)</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="-3.453639"
                          value={position?.latitude || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              setPosition(prev => prev ? { ...prev, latitude: null } : null);
                            } else {
                              const lat = parseFloat(value);
                              if (!isNaN(lat) && lat >= -90 && lat <= 90) {
                                setPosition(prev => ({
                                  ...prev,
                                  latitude: lat
                                }));
                              }
                            }
                          }}
                          min="-90"
                          max="90"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            position?.latitude !== null && position?.latitude !== undefined && 
                            (position.latitude < -90 || position.latitude > 90) 
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                        />
                        {position?.latitude !== null && position?.latitude !== undefined && 
                         (position.latitude < -90 || position.latitude > 90) && (
                          <p className="text-xs text-red-600 mt-1">
                            Latitude harus antara -90 dan 90
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Longitude <span className="text-gray-500">(-180 hingga 180)</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="114.837887"
                          value={position?.longitude || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              setPosition(prev => prev ? { ...prev, longitude: null } : null);
                            } else {
                              const lng = parseFloat(value);
                              if (!isNaN(lng) && lng >= -180 && lng <= 180) {
                                setPosition(prev => ({
                                  ...prev,
                                  longitude: lng
                                }));
                              }
                            }
                          }}
                          min="-180"
                          max="180"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            position?.longitude !== null && position?.longitude !== undefined && 
                            (position.longitude < -180 || position.longitude > 180) 
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                        />
                        {position?.longitude !== null && position?.longitude !== undefined && 
                         (position.longitude < -180 || position.longitude > 180) && (
                          <p className="text-xs text-red-600 mt-1">
                            Longitude harus antara -180 dan 180
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Address Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Alamat (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder={address || "Lokasi belum ditemukan"}
                        value={address || ''}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  {position && position.latitude && position.longitude && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MapPin className="h-5 w-5 text-green-600 mr-2" />
                        <p className="text-sm font-medium text-green-800">
                          Lokasi berhasil didapatkan
                        </p>
                      </div>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>Koordinat: {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}</p>
                        {address && <p>Alamat: {address}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile || !position || !position.latitude || !position.longitude}
              className="btn btn-primary inline-flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Kirim Laporan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateReport;