// Generic upload handler — returns Cloudinary URL for any uploaded image
const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
  res.json({
    success: true,
    imageUrl: req.file.path,
    publicId: req.file.filename,
  });
};

const uploadMultiple = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files provided' });
  }
  const images = req.files.map(f => ({ imageUrl: f.path, publicId: f.filename }));
  res.json({ success: true, images });
};

module.exports = { uploadImage, uploadMultiple };
