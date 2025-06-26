import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  // Initialize with empty position
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [watchId, setWatchId] = useState(null);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
    ...options,
  };

  // Get current position
  const getCurrentPosition = async () => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (positionData) => {
        const { latitude, longitude, accuracy } = positionData.coords;
        const locationData = {
          latitude,
          longitude,
          accuracy,
          timestamp: positionData.timestamp,
        };

        setLocation(locationData);
        setPosition({ latitude, longitude });
        
        // Get address from coordinates
        try {
          const addressResult = await getAddressFromCoords(latitude, longitude);
          setAddress(addressResult);
        } catch (err) {
          console.error('Failed to get address:', err);
        }
        
        setLoading(false);
        toast.success('Lokasi berhasil didapatkan!');
      },
      (error) => {
        let errorMessage = 'Gagal mendapatkan lokasi';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Akses lokasi ditolak. Silakan izinkan akses lokasi di browser Anda.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia. Pastikan GPS aktif.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Permintaan lokasi timeout. Silakan coba lagi.';
            break;
          default:
            errorMessage = 'Terjadi kesalahan saat mengambil lokasi. Menggunakan lokasi default Jakarta.';
            break;
        }

        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);
        
        // Keep default Jakarta location if geolocation fails
        console.log('Geolocation failed, using default Jakarta location');
      },
      defaultOptions
    );
  };

  // Watch position (continuous tracking)
  const watchPosition = () => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser';
      setError(errorMsg);
      return null;
    }

    setLoading(true);
    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationData = {
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp,
        };

        setLocation(locationData);
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Gagal memantau lokasi';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Akses lokasi ditolak. Silakan izinkan akses lokasi di browser Anda.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia. Pastikan GPS aktif.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Permintaan lokasi timeout. Silakan coba lagi.';
            break;
          default:
            errorMessage = 'Terjadi kesalahan saat memantau lokasi.';
            break;
        }

        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);
      },
      defaultOptions
    );

    return watchId;
  };

  // Clear watch
  const clearWatch = (watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  };

  // Reset state
  const reset = () => {
    setLocation(null);
    setPosition(null);
    setAddress(null);
    setError(null);
    setLoading(false);
  };

  // Check if geolocation is supported
  const isSupported = 'geolocation' in navigator;

  // Get address from coordinates (reverse geocoding)
  const getAddressFromCoords = async (lat, lng) => {
    try {
      // Try multiple geocoding services for better reliability
      const services = [
        {
          url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`,
          parser: (data) => data.display_name || 'Unknown location'
        },
        {
          url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`,
          parser: (data) => data.display_name || data.locality || 'Unknown location'
        }
      ];

      for (const service of services) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(service.url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'LAPOR App'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            const address = service.parser(data);
            if (address && address !== 'Unknown location') {
              return address;
            }
          }
        } catch (serviceError) {
          console.warn('Geocoding service failed:', serviceError.message);
          continue; // Try next service
        }
      }

      // Fallback to coordinates if all services fail
      return `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  return {
    location,
    position,
    setPosition,
    address,
    setAddress,
    error,
    loading,
    isSupported,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    reset,
    getAddressFromCoords,
  };
};

export default useGeolocation;