const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  excerpt: {
    en: { type: String, default: '' },
    ar: { type: String, default: '' },
  },
  body: {
    en: { type: String, default: '' },
    ar: { type: String, default: '' },
  },
  image: { type: String, default: '' },
  tags: [{ type: String, trim: true }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  published: { type: Boolean, default: false },
  publishedAt: Date,
  slug: { type: String, unique: true },
}, { timestamps: true });

// Auto-generate slug from English title
blogSchema.pre('save', function (next) {
  if (this.isModified('title.en')) {
    this.slug = this.title.en
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 80);
  }
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
