const express = require('express');
const router = express.Router();
const { getPublishedPosts, getPostBySlug } = require('../controllers/postController');

router.get('/', getPublishedPosts);
router.get('/:slug', getPostBySlug);

module.exports = router;
