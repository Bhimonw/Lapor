const { validationResult } = require('express-validator');
const Report = require('../models/Report');
const path = require('path');
const fs = require('fs');

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create a new report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - latitude
 *               - longitude
 *               - photo
 *             properties:
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Description of the road damage
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 description: Latitude coordinate
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 description: Longitude coordinate
 *               address:
 *                 type: string
 *                 description: Human-readable address (optional)
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Photo of the road damage
 *     responses:
 *       201:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Report created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         description: Validation error or missing data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       413:
 *         description: File too large
 *       500:
 *         description: Internal server error
 */

/**
 * Create a new road damage report
 * @async
 * @function createReport
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing report data
 * @param {string} req.body.description - Description of the road damage (10-1000 characters)
 * @param {string} req.body.latitude - Latitude coordinate (-90 to 90)
 * @param {string} req.body.longitude - Longitude coordinate (-180 to 180)
 * @param {string} [req.body.address] - Human-readable address
 * @param {Object} req.file - Uploaded photo file
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with created report or error
 */
const createReport = async (req, res) => {
  try {
    // Log incoming data for debugging
    console.log('=== CREATE REPORT REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');
    console.log('Location data received:', {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      address: req.body.address,
      latType: typeof req.body.latitude,
      lngType: typeof req.body.longitude
    });
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { description, latitude, longitude, address } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Photo is required'
      });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    console.log('Parsed coordinates:', {
      originalLat: latitude,
      originalLng: longitude,
      parsedLat: lat,
      parsedLng: lng,
      latValid: !isNaN(lat) && lat >= -90 && lat <= 90,
      lngValid: !isNaN(lng) && lng >= -180 && lng <= 180
    });
    
    if (isNaN(lat) || isNaN(lng)) {
      console.log('Coordinate validation failed - NaN values');
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided'
      });
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.log('Coordinate validation failed - out of range');
      return res.status(400).json({
        success: false,
        message: 'Coordinates out of valid range'
      });
    }

    // Create report
    const reportData = {
      user: req.user._id,
      description,
      photoUrl: `/uploads/${req.file.filename}`,
      location: {
        type: 'Point',
        coordinates: [lng, lat] // [longitude, latitude]
      },
      address: address || '',
      statusHistory: [{
        status: 'pending',
        changedBy: req.user._id,
        note: 'Laporan dibuat',
        changedAt: new Date()
      }]
    };
    
    console.log('Creating report with data:', {
      coordinates: reportData.location.coordinates,
      address: reportData.address,
      description: reportData.description.substring(0, 50) + '...'
    });
    
    const report = new Report(reportData);
    await report.save();
    
    console.log('Report saved successfully with ID:', report._id);
    console.log('Saved coordinates:', report.location.coordinates);
    console.log('Virtual latitude:', report.latitude);
    console.log('Virtual longitude:', report.longitude);
    
    // Populate user data
    await report.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: {
        report
      }
    });
  } catch (error) {
    console.error('Create report error:', error);
    
    // Delete uploaded file if report creation failed
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating report'
    });
  }
};

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports with pagination and filtering
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, verified, rejected]
 *         description: Filter by report status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of reports per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     reports:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Report'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */

/**
 * Get all reports with pagination and filtering (Admin only)
 * @async
 * @function getAllReports
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.status] - Filter by report status
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=10] - Number of reports per page
 * @param {string} [req.query.sortBy='createdAt'] - Field to sort by
 * @param {string} [req.query.sortOrder='desc'] - Sort order (asc/desc)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with reports and pagination info
 */
const getAllReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter
    const filter = {};
    if (status && ['pending', 'verified', 'rejected'].includes(status)) {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get reports with pagination
    const reports = await Report.find(filter)
      .populate('user', 'name email')
      .populate('verifiedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Debug logging for location data
    console.log('=== GET REPORTS LOCATION DEBUG ===');
    console.log(`Found ${reports.length} reports`);
    reports.forEach((report, index) => {
      if (index < 3) { // Log first 3 reports to avoid spam
        console.log(`Report ${report._id}:`, {
          coordinates: report.location?.coordinates,
          latitude: report.latitude,
          longitude: report.longitude,
          address: report.address
        });
      }
    });

    // Get total count for pagination
    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reports,
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports'
    });
  }
};

// Get user's own reports
const getUserReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter for user's reports
    const filter = { user: req.user._id };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Add search filter if provided
    if (search && search.trim()) {
      filter.$or = [
        { description: { $regex: search.trim(), $options: 'i' } },
        { address: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const reports = await Report.find(filter)
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reports,
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user reports'
    });
  }
};

// Get single report
const getReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id)
      .populate('user', 'name email')
      .populate('verifiedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user can access this report
    if (req.user.role !== 'admin' && report.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        report
      }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching report'
    });
  }
};

// Verify report (admin only)
const verifyReport = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, note } = req.body;
    const attachmentFile = req.file;

    // Debug logging
    console.log('=== VERIFY REPORT REQUEST ===');
    console.log('Report ID:', id);
    console.log('Status received:', status);
    console.log('Note received:', note);
    console.log('File received:', attachmentFile ? attachmentFile.filename : 'No file');
    console.log('Request body:', req.body);

    if (!['verified', 'rejected', 'in_progress', 'working', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "verified", "rejected", "in_progress", "working", or "completed"'
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Validate status transition based on current status
    const allowedTransitions = {
      pending: ['verified', 'rejected'],
      verified: ['in_progress'],
      in_progress: ['working'],
      working: ['completed'],
      completed: [],
      rejected: []
    };

    if (!allowedTransitions[report.status] || !allowedTransitions[report.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${report.status} to ${status}. Allowed transitions: ${allowedTransitions[report.status]?.join(', ') || 'none'}`
      });
    }

    // Update report based on status
    report.status = status;
    
    // Add to status history
    const statusHistoryEntry = {
      status: status,
      changedBy: req.user._id,
      note: note || '',
      changedAt: new Date()
    };
    
    // Add attachment if file was uploaded (optional)
    if (attachmentFile) {
      statusHistoryEntry.attachmentUrl = `/uploads/${attachmentFile.filename}`;
    }
    
    report.statusHistory.push(statusHistoryEntry);
    
    // Update specific fields based on status
    switch(status) {
      case 'verified':
        report.verifiedBy = req.user._id;
        report.verificationNote = note || '';
        report.verifiedAt = new Date();
        break;
      case 'in_progress':
        report.processedBy = req.user._id;
        report.processedNote = note || '';
        report.processedAt = new Date();
        break;
      case 'working':
        report.workingBy = req.user._id;
        report.workingNote = note || '';
        report.workingAt = new Date();
        break;
      case 'completed':
        report.completedBy = req.user._id;
        report.completedNote = note || '';
        report.completedAt = new Date();
        break;
      case 'rejected':
        report.verifiedBy = req.user._id;
        report.verificationNote = note || '';
        report.verifiedAt = new Date();
        break;
    }

    await report.save();
    
    // Populate data for response
    await report.populate('user', 'name email');
    await report.populate('verifiedBy', 'name email');

    res.json({
      success: true,
      message: `Report ${status} successfully`,
      data: {
        report
      }
    });
  } catch (error) {
    console.error('Verify report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying report'
    });
  }
};

// Delete report
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user can delete this report
    if (req.user.role !== 'admin' && report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete photo file
    if (report.photoUrl) {
      const filename = path.basename(report.photoUrl);
      const filePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Report.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting report'
    });
  }
};

// Get reports by status (admin only)
const getReportsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const validStatuses = ['pending', 'verified', 'rejected', 'in_progress', 'working', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status parameter'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reports = await Report.find({ status })
      .populate('user', 'name email')
      .populate('verifiedBy', 'name email')
      .populate('processedBy', 'name email')
      .populate('workingBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('statusHistory.changedBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments({ status });
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReports: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get reports by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports'
    });
  }
};

// Get report status history
const getReportStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id)
      .populate('statusHistory.changedBy', 'name email')
      .select('statusHistory status');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Sort status history by date (newest first)
    const sortedHistory = report.statusHistory.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));

    res.json({
      success: true,
      data: {
        currentStatus: report.status,
        history: sortedHistory
      }
    });
  } catch (error) {
    console.error('Get report status history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching status history'
    });
  }
};

// Get dashboard statistics with new statuses
const getDashboardStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalReports = await Report.countDocuments();
    const recentReports = await Report.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalReports,
        statusBreakdown: stats,
        recentReports
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getUserReports,
  getReport,
  verifyReport,
  deleteReport,
  getReportsByStatus,
  getReportStatusHistory,
  getDashboardStats
};