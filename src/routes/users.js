const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, resetPassword, updateUserStatus } = require('../controllers/userController');
const { protect, requirePermission } = require('../middleware/auth');

// All routes here require MANAGE_USERS permission
router.use(protect);
router.use(requirePermission('MANAGE_USERS'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .put(updateUser);

router.route('/:id/reset-password')
  .post(resetPassword);

router.route('/:id/status')
  .put(updateUserStatus);

module.exports = router;
