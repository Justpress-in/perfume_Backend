const Settings = require('../models/Settings');

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

module.exports = { get, update };
