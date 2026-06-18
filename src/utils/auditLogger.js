const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, action, resourceType, resourceId = null, details = {}) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      resourceType,
      resourceId,
      details
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

module.exports = logAudit;
