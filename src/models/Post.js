const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // SEO Fields
  seoTitle: { type: String },
  seoDescription: { type: String },
  focusKeyword: { type: String },
  canonicalUrl: { type: String },
  isIndexingAllowed: { type: Boolean, default: true },
  
  status: {
    type: String,
    enum: ['DRAFT', 'IN_REVIEW', 'REJECTED', 'PUBLISHED'],
    default: 'DRAFT'
  },
  rejectionFeedback: {
    type: String,
    default: ''
  },
  publishedAt: { type: Date },
  
  // Revision System
  hasPendingUpdates: { type: Boolean, default: false },
  pendingUpdates: {
    type: Object,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
