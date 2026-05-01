const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20,
      category, subcategory, isActive,
      search, sortBy = 'createdAt', order = 'desc',
    } = req.query;

    const filter = {};
    if (category) filter.category = { $regex: category.trim(), $options: 'i' };
    if (subcategory) filter.subcategory = { $regex: subcategory.trim(), $options: 'i' };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      const re = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { 'name.en': re },
        { 'name.ar': re },
        { 'description.en': re },
        { 'description.ar': re },
       ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id — partial update
const patchProduct = async (req, res, next) => {
  try {
    const allowed = [
      'isActive', 'isFeatured', 'price', 'stock', 'features', 'purchaseLinks',
      'weight', 'dimensions', 'sizeVariants',
    ];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id — soft delete
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/products/:id/image  — upload/replace single primary image
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.imagePublicId) {
      try { await cloudinary.uploader.destroy(product.imagePublicId); } catch (_e) { /* ignore */ }
    }

    product.image = req.file.path;
    product.imagePublicId = req.file.filename;

    // Keep images array in sync — replace or add first entry
    if (product.images.length > 0) {
      product.images[0] = { url: req.file.path, publicId: req.file.filename };
    } else {
      product.images.unshift({ url: req.file.path, publicId: req.file.filename });
    }

    await product.save();
    res.json({ success: true, imageUrl: product.image, data: product });
  } catch (err) {
    next(err);
  }
};

// POST /api/products/:id/images  — add one or more additional images
const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const newImages = req.files.map(f => ({ url: f.path, publicId: f.filename }));
    product.images.push(...newImages);

    // Ensure the primary image field reflects first image
    if (!product.image && product.images.length > 0) {
      product.image = product.images[0].url;
      product.imagePublicId = product.images[0].publicId;
    }

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id/images/:index — remove an image by its array index
const deleteImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const idx = parseInt(req.params.index);
    if (isNaN(idx) || idx < 0 || idx >= product.images.length) {
      return res.status(400).json({ success: false, message: 'Invalid image index' });
    }

    const [removed] = product.images.splice(idx, 1);
    if (removed?.publicId) {
      try { await cloudinary.uploader.destroy(removed.publicId); } catch (_e) { /* ignore */ }
    }

    // Keep primary image field in sync
    if (product.images.length > 0) {
      product.image = product.images[0].url;
      product.imagePublicId = product.images[0].publicId;
    } else {
      product.image = '';
      product.imagePublicId = '';
    }

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts, getProduct, createProduct, updateProduct, patchProduct,
  deleteProduct, uploadImage, uploadImages, deleteImage,
};
