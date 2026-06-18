const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // e.g. "CREATED_POST", "UPDATED_USER"
  resourceType: { type: String, required: true }, // e.g. "Post", "User"
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: Object } // Store what changed
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
