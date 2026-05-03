const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');

// GET /api/blog
const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, published, tag } = req.query;
    const filter = {};
    if (published !== undefined) filter.published = published === 'true';
    if (tag) filter.tags = tag;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [posts, total] = await Promise.all([
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'name'),
      Blog.countDocuments(filter),
    ]);

    res.json({ success: true, data: posts, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    next(err);
  }
};

// GET /api/blog/:idOrSlug
const getPost = async (req, res, next) => {
  try {
    const post = await Blog.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
    }).populate('author', 'name');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// POST /api/blog
const createPost = async (req, res, next) => {
  try {
    const post = await Blog.create({ ...req.body, author: req.admin._id });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// PUT /api/blog/:id
const updatePost = async (req, res, next) => {
  try {
    const post = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/blog/:id/publish — toggle published
const togglePublish = async (req, res, next) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.published = !post.published;
    await post.save();
    res.json({ success: true, published: post.published, data: post });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/blog/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await Blog.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/blog/:id/image
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.imagePublicId) {
      try { await cloudinary.uploader.destroy(post.imagePublicId); } catch (_) {}
    }

    post.image = req.file.path;
    post.imagePublicId = req.file.filename;
    await post.save();
    res.json({ success: true, imageUrl: post.image, data: post });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPosts, getPost, createPost, updatePost, uploadImage, togglePublish, deletePost };
