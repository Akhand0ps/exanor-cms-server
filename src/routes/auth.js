const express = require('express');
const router = express.Router();
const { authUser, changePassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', authUser);
router.post('/change-password', protect, changePassword);
router.put('/profile', protect, updateProfile);

module.exports = router;
