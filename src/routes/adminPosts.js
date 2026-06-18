const express = require('express');
const router = express.Router();
const { getAdminPosts, createPost, updatePost, deletePost } = require('../controllers/postController');
const { protect, requirePermission } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(requirePermission('READ_POST'), getAdminPosts)
  .post(requirePermission('CREATE_POST'), createPost);

router.route('/:id')
  .put(requirePermission('UPDATE_POST'), updatePost)
  .delete(deletePost);

module.exports = router;
