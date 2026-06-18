const Setting = require('../models/Setting');

// @desc    Get global settings
// @route   GET /api/public/settings OR /api/admin/settings
// @access  Public or Private
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({}); // create default if not exists
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update global settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res) => {
  try {
    const { windowsUrl, macSiliconUrl, macIntelUrl, isMaintenanceMode } = req.body;

    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    if (windowsUrl !== undefined) settings.windowsUrl = windowsUrl;
    if (macSiliconUrl !== undefined) settings.macSiliconUrl = macSiliconUrl;
    if (macIntelUrl !== undefined) settings.macIntelUrl = macIntelUrl;
    if (isMaintenanceMode !== undefined) settings.isMaintenanceMode = isMaintenanceMode;

    await settings.save();

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
