const User = require('../models/User');
const logAudit = require('../utils/auditLogger');
const crypto = require('crypto');

// Helper to generate a secure temporary password
const generateTempPassword = () => crypto.randomBytes(6).toString('hex');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (MANAGE_USERS)
const getUsers = async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json(users);
};

// @desc    Create a new user (Intern or Admin)
// @route   POST /api/admin/users
// @access  Private (MANAGE_USERS)
const createUser = async (req, res) => {
  const { firstName, email, temporaryPassword, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const generatedPassword = temporaryPassword || generateTempPassword();
  
  const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'INTERN';
  const assignedPermissions = assignedRole === 'ADMIN' 
    ? ['CREATE_POST', 'READ_POST', 'UPDATE_POST', 'DELETE_POST', 'PUBLISH_POST', 'MANAGE_USERS']
    : ['CREATE_POST', 'READ_POST', 'UPDATE_POST'];

  const user = await User.create({
    name: firstName,
    firstName,
    email,
    password: generatedPassword,
    role: assignedRole,
    permissions: assignedPermissions,
    requiresPasswordChange: true
  });

  if (user) {
    await logAudit(req.user._id, 'CREATE_USER', 'User', user._id, { role: user.role, email: user.email });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      firstName: user.firstName,
      email: user.email,
      role: user.role,
      temporaryPassword: generatedPassword // Send back exactly once
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Update user profile
// @route   PUT /api/admin/users/:id
// @access  Private (MANAGE_USERS)
const updateUser = async (req, res) => {
  const { firstName, email, profileImage, bio, linkedIn, twitter } = req.body;
  const user = await User.findById(req.params.id);

  if (user) {
    user.firstName = firstName || user.firstName;
    user.name = firstName || user.name;
    user.email = email || user.email;
    user.profileImage = profileImage !== undefined ? profileImage : user.profileImage;
    user.bio = bio !== undefined ? bio : user.bio;
    user.linkedIn = linkedIn !== undefined ? linkedIn : user.linkedIn;
    user.twitter = twitter !== undefined ? twitter : user.twitter;

    const updatedUser = await user.save();
    await logAudit(req.user._id, 'UPDATE_USER', 'User', updatedUser._id, {});

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      email: updatedUser.email
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Reset password for a user
// @route   POST /api/admin/users/:id/reset-password
// @access  Private (MANAGE_USERS)
const resetPassword = async (req, res) => {
  const { newTemporaryPassword } = req.body;
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'SUPER_ADMIN') {
      return res.status(400).json({ message: 'Cannot reset SUPER_ADMIN password' });
    }

    const generatedPassword = newTemporaryPassword || generateTempPassword();
    user.password = generatedPassword;
    user.requiresPasswordChange = true;
    await user.save();

    await logAudit(req.user._id, 'RESET_PASSWORD', 'User', user._id, {});

    res.json({
      message: 'Password reset successful',
      temporaryPassword: generatedPassword
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user status (Enable/Disable)
// @route   PUT /api/admin/users/:id/status
// @access  Private (MANAGE_USERS)
const updateUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'SUPER_ADMIN') {
       return res.status(400).json({ message: 'Cannot disable SUPER_ADMIN' });
    }
    user.isActive = req.body.isActive;
    const updatedUser = await user.save();

    const action = updatedUser.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER';
    await logAudit(req.user._id, action, 'User', updatedUser._id, { isActive: updatedUser.isActive });

    res.json({
      _id: updatedUser._id,
      isActive: updatedUser.isActive
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = { getUsers, createUser, updateUser, resetPassword, updateUserStatus };
