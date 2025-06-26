import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
    ...options,
  };

  // Get current position
  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
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

        toast.success('Location detected successfully!');
      },
      (error) => {
        let errorMessage = 'Failed to get location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving location';
            break;
        }

        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);
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
        let errorMessage = 'Failed to watch location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred while watching location';
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
    setError(null);
    setLoading(false);
  };

  // Check if geolocation is supported
  const isSupported = 'geolocation' in navigator;

  // Get address from coordinates (reverse geocoding)
  const getAddressFromCoords = async (lat, lng) => {
    try {
      // Using a free geocoding service (you can replace with your preferred service)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`
      );

      if (response.ok) {
        const data = await response.json();
        return data.display_name || data.locality || 'Unknown location';
      }

      return 'Address not found';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Failed to get address';
    }
  };

  return {
    location,
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