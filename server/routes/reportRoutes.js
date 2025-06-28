const express = require('express');
const { body } = require('express-validator');
const {
  createReport,
  getAllReports,
  getUserReports,
  getReport,
  verifyReport,
  deleteReport,
  getReportsByStatus,
  getReportStatusHistory,
  getDashboardStats
} = require('../controllers/reportController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const { upload, handleUploadError } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Validation rules
const createReportValidation = [
  body('description')
    .notEmpty()
    .withMessage('Deskripsi tidak boleh kosong')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Deskripsi harus antara 10 hingga 1000 karakter'),
  
  body('latitude')
    .notEmpty()
    .withMessage('Latitude tidak boleh kosong')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude harus berupa angka valid antara -90 hingga 90'),
  
  body('longitude')
    .notEmpty()
    .withMessage('Longitude tidak boleh kosong')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude harus berupa angka valid antara -180 hingga 180'),
  
  body('address')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Alamat harus antara 1 hingga 500 karakter'),
];

const verifyReportValidation = [
  body('status')
    .isIn(['verified', 'rejected', 'in_progress', 'working', 'completed'])
    .withMessage('Status must be verified, rejected, in_progress, working, or completed'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters')
];

// Routes

// @route   POST /api/reports
// @desc    Create a new report
// @access  Private (User)
router.post(
  '/',
  authMiddleware,
  upload.single('photo'),
  handleUploadError,
  createReportValidation,
  createReport
);

// @route   GET /api/reports
// @desc    Get all reports (admin) or user's reports
// @access  Private
router.get('/', authMiddleware, (req, res, next) => {
  if (req.user.role === 'admin') {
    return getAllReports(req, res, next);
  } else {
    return getUserReports(req, res, next);
  }
});

// @route   GET /api/reports/all
// @desc    Get all reports (admin only)
// @access  Private (Admin)
router.get('/all', authMiddleware, adminMiddleware, getAllReports);

// @route   GET /api/reports/my
// @desc    Get current user's reports
// @access  Private (User)
router.get('/my', authMiddleware, getUserReports);

// @route   GET /api/reports/:id
// @desc    Get single report
// @access  Private
router.get('/:id', authMiddleware, getReport);

// @route   PATCH /api/reports/:id/verify
// @desc    Verify/reject a report
// @access  Private (Admin)
router.patch(
  '/:id/verify',
  authMiddleware,
  adminMiddleware,
  upload.single('attachment'),
  handleUploadError,
  verifyReportValidation,
  verifyReport
);

// @route   DELETE /api/reports/:id
// @desc    Delete a report
// @access  Private (Admin or Report Owner)
router.delete('/:id', authMiddleware, deleteReport);

// @route   GET /api/reports/status/:status
// @desc    Get reports by status
// @access  Private (Admin)
router.get('/status/:status', authMiddleware, adminMiddleware, getReportsByStatus);

// @route   GET /api/reports/:id/history
// @desc    Get report status history
// @access  Private (Admin)
router.get('/:id/history', authMiddleware, adminMiddleware, getReportStatusHistory);

// @route   GET /api/reports/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/dashboard/stats', authMiddleware, adminMiddleware, getDashboardStats);

module.exports = router;