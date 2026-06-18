const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  windowsUrl: {
    type: String,
    default: 'https://exanor-production-media-bucket.s3.ap-south-1.amazonaws.com/exanor-software/ExanorStorePartner-Setup-1.0.12.exe'
  },
  macSiliconUrl: {
    type: String,
    default: ''
  },
  macIntelUrl: {
    type: String,
    default: ''
  },
  isMaintenanceMode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', SettingSchema);
