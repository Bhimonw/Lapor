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
  const getCurrentPosition = async (options = {}) => {
    if (!isSupported) {
      throw new Error('Geolocation tidak didukung oleh browser ini.');
    }

    setLoading(true);
    setError(null);

    const finalOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          console.log('=== GEOLOCATION DEBUG ===');
          console.log('Raw position from browser:', position);
          console.log('Extracted coordinates:', { latitude, longitude, accuracy });
          console.log('Coordinate types:', { 
            latType: typeof latitude, 
            lngType: typeof longitude,
            latValue: latitude,
            lngValue: longitude
          });
          
          setPosition({ latitude, longitude, accuracy });
          setLocation(position);
          
          // Get address from coordinates
          try {
            console.log('Attempting reverse geocoding for:', latitude, longitude);
            const addressResult = await getAddressFromCoords(latitude, longitude);
            console.log('Reverse geocoding result:', addressResult);
            setAddress(addressResult);
          } catch (error) {
            console.warn('Failed to get address:', error);
            const fallbackAddress = `Koordinat: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            console.log('Using fallback address:', fallbackAddress);
            setAddress(fallbackAddress);
          }
          
          setLoading(false);
          resolve({ latitude, longitude, accuracy });
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
          reject(new Error(errorMessage));
        },
        finalOptions
      );
    });
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
      console.log('=== REVERSE GEOCODING DEBUG ===');
      console.log('Input coordinates:', { lat, lng });
      console.log('Coordinate validation:', {
        latValid: lat >= -90 && lat <= 90,
        lngValid: lng >= -180 && lng <= 180,
        latType: typeof lat,
        lngType: typeof lng
      });
      
      // Try multiple geocoding services for better reliability
      const services = [
        {
          name: 'OpenStreetMap Nominatim',
          url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`,
          parser: (data) => data.display_name || 'Unknown location'
        },
        {
          name: 'BigDataCloud',
          url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`,
          parser: (data) => data.display_name || data.locality || 'Unknown location'
        }
      ];

      for (const service of services) {
        try {
          console.log(`Trying ${service.name} service:`, service.url);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(service.url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'LAPOR App'
            }
          });
          
          clearTimeout(timeoutId);
          
          console.log(`${service.name} response status:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`${service.name} response data:`, data);
            
            const address = service.parser(data);
            console.log(`${service.name} parsed address:`, address);
            
            if (address && address !== 'Unknown location') {
              console.log('Successfully got address:', address);
              return address;
            }
          }
        } catch (serviceError) {
          console.warn(`${service.name} service failed:`, serviceError.message);
          continue; // Try next service
        }
      }

      // Fallback to coordinates if all services fail
      const fallback = `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      console.log('All services failed, using fallback:', fallback);
      return fallback;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      const fallback = `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      console.log('Error occurred, using fallback:', fallback);
      return fallback;
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