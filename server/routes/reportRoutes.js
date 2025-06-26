const express = require('express');
const { body } = require('express-validator');
const {
  createReport,
  getAllReports,
  getUserReports,
  getReport,
  verifyReport,
  deleteReport
} = require('../controllers/reportController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const { upload, handleUploadError } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Validation rules
const createReportValidation = [
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters')
];

const verifyReportValidation = [
  body('status')
    .isIn(['verified', 'rejected'])
    .withMessage('Status must be either verified or rejected'),
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
  verifyReportValidation,
  verifyReport
);

// @route   DELETE /api/reports/:id
// @desc    Delete a report
// @access  Private (Admin or Report Owner)
router.delete('/:id', authMiddleware, deleteReport);

module.exports = router;