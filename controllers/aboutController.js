const About = require('../models/About');
const cloudinary = require('../config/cloudinary');

// Always one document; create it if missing
const getOrCreate = async () => {
  let doc = await About.findOne();
  if (!doc) doc = await About.create({});
  return doc;
};

const get = async (req, res, next) => {
  try {
    const doc = await getOrCreate();
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const doc = await getOrCreate();
    const { pageTitle, sections } = req.body;
    if (pageTitle) doc.pageTitle = pageTitle;
    if (sections !== undefined) doc.sections = sections;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// POST /api/about/sections  — add a new section
const addSection = async (req, res, next) => {
  try {
    const doc = await getOrCreate();
    doc.sections.push(req.body);
    await doc.save();
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// PUT /api/about/sections/:sectionId  — edit a section
const updateSection = async (req, res, next) => {
  try {
    const doc = await getOrCreate();
    const sec = doc.sections.id(req.params.sectionId);
    if (!sec) return res.status(404).json({ success: false, message: 'Section not found' });
    Object.assign(sec, req.body);
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// DELETE /api/about/sections/:sectionId
const removeSection = async (req, res, next) => {
  try {
    const doc = await getOrCreate();
    const sec = doc.sections.id(req.params.sectionId);
    if (!sec) return res.status(404).json({ success: false, message: 'Section not found' });
    if (sec.imagePublicId) {
      try { await cloudinary.uploader.destroy(sec.imagePublicId); } catch (_) {}
    }
    sec.deleteOne();
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// POST /api/about/sections/:sectionId/image
const uploadSectionImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file' });
    const doc = await getOrCreate();
    const sec = doc.sections.id(req.params.sectionId);
    if (!sec) return res.status(404).json({ success: false, message: 'Section not found' });
    if (sec.imagePublicId) {
      try { await cloudinary.uploader.destroy(sec.imagePublicId); } catch (_) {}
    }
    sec.image = req.file.path;
    sec.imagePublicId = req.file.filename;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

module.exports = { get, update, addSection, updateSection, removeSection, uploadSectionImage };
