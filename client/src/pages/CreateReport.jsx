import { useState } from 'react';
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
    address,
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
    if (!selectedFile) {
      toast.error('Foto laporan wajib diupload');
      return;
    }
    
    if (!position) {
      toast.error('Lokasi wajib didapatkan');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('description', data.description);
      formData.append('photo', selectedFile);
      formData.append('latitude', position.latitude);
      formData.append('longitude', position.longitude);
      
      if (address) {
        formData.append('address', address);
      }

      await reportService.createReport(formData);
      
      toast.success('Laporan berhasil dibuat!');
      navigate('/reports/my');
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Gagal membuat laporan');
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
                  
                  {position && (
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
              disabled={isSubmitting || !selectedFile || !position}
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