const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

// Public route to fetch settings (e.g. for the nextjs website)
router.get('/public/settings', getSettings);

// Protected admin routes for console
router.get('/admin/settings', protect, getSettings);
router.put('/admin/settings', protect, updateSettings);

module.exports = router;
