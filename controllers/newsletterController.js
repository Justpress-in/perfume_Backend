const Newsletter = require('../models/Newsletter');

// POST /api/newsletter/subscribe (public)
const subscribe = async (req, res, next) => {
  try {
    const { email, name, language, source } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.isSubscribed) return res.json({ success: true, message: 'Already subscribed' });
      existing.isSubscribed = true;
      existing.unsubscribedAt = null;
      await existing.save();
      return res.json({ success: true, message: 'Resubscribed', data: existing });
    }
    const sub = await Newsletter.create({ email, name, language, source });
    res.status(201).json({ success: true, message: 'Subscribed', data: sub });
  } catch (err) { next(err); }
};

// POST /api/newsletter/unsubscribe (public)
const unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    const sub = await Newsletter.findOneAndUpdate(
      { email: (email || '').toLowerCase() },
      { isSubscribed: false, unsubscribedAt: new Date() },
      { new: true }
    );
    if (!sub) return res.status(404).json({ success: false, message: 'Email not found' });
    res.json({ success: true, message: 'Unsubscribed' });
  } catch (err) { next(err); }
};

// Admin
const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, isSubscribed, search } = req.query;
    const filter = {};
    if (isSubscribed !== undefined) filter.isSubscribed = isSubscribed === 'true';
    if (search) filter.email = new RegExp(search, 'i');
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      Newsletter.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Newsletter.countDocuments(filter),
    ]);
    res.json({ success: true, data, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const sub = await Newsletter.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

const exportCsv = async (_req, res, next) => {
  try {
    const subs = await Newsletter.find({ isSubscribed: true }).sort({ createdAt: -1 });
    const rows = ['Email,Name,Language,Source,Subscribed At',
      ...subs.map(s => `${s.email},"${s.name || ''}",${s.language},${s.source},${s.createdAt.toISOString()}`),
    ];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="newsletter.csv"');
    res.send(rows.join('\n'));
  } catch (err) { next(err); }
};

module.exports = { subscribe, unsubscribe, list, remove, exportCsv };
