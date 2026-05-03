const Settings = require('../models/Settings');
const cloudinary = require('../config/cloudinary');

const KEY = 'global';

const get = async (_req, res, next) => {
  try {
    let s = await Settings.findOne({ key: KEY });
    if (!s) s = await Settings.create({ key: KEY });
    res.json({ success: true, data: s });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const s = await Settings.findOneAndUpdate(
      { key: KEY },
      { ...req.body, key: KEY },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: s });
  } catch (err) { next(err); }
};

// POST /api/settings/upload?slot=logo|favicon
const uploadAsset = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
    const slot = req.query.slot; // 'logo' or 'favicon'
    if (!['logo', 'favicon'].includes(slot)) {
      return res.status(400).json({ success: false, message: 'slot must be logo or favicon' });
    }

    let s = await Settings.findOne({ key: KEY });
    if (!s) s = await Settings.create({ key: KEY });

    const publicIdField = `${slot}PublicId`;

    // Delete old Cloudinary asset if exists
    if (s[publicIdField]) {
      try { await cloudinary.uploader.destroy(s[publicIdField]); } catch (_) {}
    }

    s[slot] = req.file.path;
    s[publicIdField] = req.file.filename;
    await s.save();

    res.json({ success: true, url: s[slot], data: s });
  } catch (err) { next(err); }
};

module.exports = { get, update, uploadAsset };
