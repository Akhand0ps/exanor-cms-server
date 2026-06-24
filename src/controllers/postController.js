const Post = require('../models/Post');
const logAudit = require('../utils/auditLogger');

// @desc    Fetch all published posts (Public)
// @route   GET /api/public/posts
// @access  Public
const getPublishedPosts = async (req, res) => {
  const posts = await Post.find({ status: 'PUBLISHED' })
    .populate('author', 'name firstName profileImage bio')
    .sort('-publishedAt');
  res.json(posts);
};

// @desc    Fetch single published post by slug
// @route   GET /api/public/posts/:slug
// @access  Public
const getPostBySlug = async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, status: 'PUBLISHED' })
    .populate('author', 'name firstName profileImage bio');
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
};

// @desc    Fetch all posts including drafts (Admin)
// @route   GET /api/admin/posts
// @access  Private (READ_POST)
const getAdminPosts = async (req, res) => {
  const query = req.user.role === 'ADMIN' ? {} : { author: req.user._id };
  const posts = await Post.find(query)
    .populate('author', 'name firstName profileImage')
    .sort('-updatedAt');
  res.json(posts);
};

// @desc    Create a post (Admin)
// @route   POST /api/admin/posts
// @access  Private (CREATE_POST)
const createPost = async (req, res) => {
  const post = new Post({
    ...req.body,
    status: 'DRAFT', // Always force draft on creation
    author: req.user._id
  });

  const createdPost = await post.save();

  await logAudit(req.user._id, 'CREATE_POST', 'Post', createdPost._id, { title: createdPost.title });

  res.status(201).json(createdPost);
};

// @desc    Update a post
// @route   PUT /api/admin/posts/:id
// @access  Private (UPDATE_POST)
const updatePost = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
    const isOwner = post.author.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    if (isAdmin && req.body.approveUpdates) {
      if (post.hasPendingUpdates && post.pendingUpdates) {
        Object.assign(post, post.pendingUpdates);
        post.hasPendingUpdates = false;
        post.pendingUpdates = null;
        const updatedPost = await post.save();
        await logAudit(req.user._id, 'APPROVE_POST_UPDATES', 'Post', updatedPost._id, { title: updatedPost.title });
        return res.json(updatedPost);
      } else {
        return res.status(400).json({ message: 'No pending updates to approve' });
      }
    }

    if (isAdmin && req.body.rejectUpdates) {
      post.hasPendingUpdates = false;
      post.pendingUpdates = null;
      const updatedPost = await post.save();
      await logAudit(req.user._id, 'REJECT_POST_UPDATES', 'Post', updatedPost._id, { title: updatedPost.title });
      return res.json(updatedPost);
    }

    if (!isAdmin && post.status === 'PUBLISHED') {
      // Save edits as pending updates for Admin review
      const allowedUpdates = { ...req.body };
      delete allowedUpdates.status;
      delete allowedUpdates.rejectionFeedback;
      delete allowedUpdates.isFeatured;

      post.pendingUpdates = allowedUpdates;
      post.hasPendingUpdates = true;
      
      const updatedPost = await post.save();
      await logAudit(req.user._id, 'SUBMIT_POST_UPDATES', 'Post', updatedPost._id, { title: updatedPost.title });
      return res.json(updatedPost);
    }

    if (!isAdmin) {
      // Intern restrictions
      if (req.body.status && !['DRAFT', 'IN_REVIEW'].includes(req.body.status)) {
        return res.status(403).json({ message: 'Interns can only set status to DRAFT or IN_REVIEW' });
      }
      delete req.body.rejectionFeedback; // Interns cannot set feedback
      delete req.body.isFeatured; // Interns cannot set featured status
    }

    Object.assign(post, req.body);

    if (req.body.status === 'PUBLISHED' && !post.publishedAt) {
      post.publishedAt = Date.now();
    }

    const updatedPost = await post.save();
    
    // Detailed Audit Logging
    let action = 'UPDATE_POST';
    if (req.body.status === 'IN_REVIEW' && post.status !== 'IN_REVIEW') action = 'SUBMIT_POST_FOR_REVIEW';
    if (req.body.status === 'REJECTED') action = 'REJECT_POST';
    if (req.body.status === 'PUBLISHED') action = 'PUBLISH_POST';
    
    await logAudit(req.user._id, action, 'Post', updatedPost._id, { status: updatedPost.status });

    res.json(updatedPost);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/admin/posts/:id
// @access  Private (DELETE_POST)
const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = post.author.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }
    if (!isAdmin && post.status !== 'DRAFT') {
      return res.status(403).json({ message: 'Interns can only delete drafts' });
    }

    await post.deleteOne();
    await logAudit(req.user._id, 'DELETE_POST', 'Post', post._id, { title: post.title });
    res.json({ message: 'Post removed' });
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
};

module.exports = { getPublishedPosts, getPostBySlug, getAdminPosts, createPost, updatePost, deletePost };
