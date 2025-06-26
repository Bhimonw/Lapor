import api from './api';

const reportService = {
  // Create new report
  createReport: async (reportData) => {
    try {
      const formData = new FormData();
      
      // Append form fields
      formData.append('description', reportData.description);
      formData.append('latitude', reportData.latitude);
      formData.append('longitude', reportData.longitude);
      
      if (reportData.address) {
        formData.append('address', reportData.address);
      }
      
      if (reportData.photo) {
        formData.append('photo', reportData.photo);
      }
      
      const response = await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        return response.data.data.report;
      }
      
      throw new Error(response.data.message || 'Failed to create report');
    } catch (error) {
      throw error;
    }
  },

  // Get all reports (admin) or user reports
  getReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add query parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/reports?${queryParams.toString()}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to fetch reports');
    } catch (error) {
      throw error;
    }
  },

  // Get all reports (admin only)
  getAllReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/reports/all?${queryParams.toString()}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to fetch all reports');
    } catch (error) {
      throw error;
    }
  },

  // Get user's own reports
  getUserReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/reports/my?${queryParams.toString()}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to fetch user reports');
    } catch (error) {
      throw error;
    }
  },

  // Get single report
  getReport: async (id) => {
    try {
      const response = await api.get(`/reports/${id}`);
      
      if (response.data.success) {
        return response.data.data.report;
      }
      
      throw new Error(response.data.message || 'Failed to fetch report');
    } catch (error) {
      throw error;
    }
  },

  // Verify report (admin only)
  verifyReport: async (id, verificationData) => {
    try {
      const response = await api.patch(`/reports/${id}/verify`, verificationData);
      
      if (response.data.success) {
        return response.data.data.report;
      }
      
      throw new Error(response.data.message || 'Failed to verify report');
    } catch (error) {
      throw error;
    }
  },

  // Delete report
  deleteReport: async (id) => {
    try {
      const response = await api.delete(`/reports/${id}`);
      
      if (response.data.success) {
        return true;
      }
      
      throw new Error(response.data.message || 'Failed to delete report');
    } catch (error) {
      throw error;
    }
  },

  // Get image URL
  getImageUrl: (photoUrl) => {
    if (!photoUrl) return null;
    
    // If it's already a full URL, return as is
    if (photoUrl.startsWith('http')) {
      return photoUrl;
    }
    
    // Otherwise, construct the full URL
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseURL.replace('/api', '')}${photoUrl}`;
  },
};

export default reportService;