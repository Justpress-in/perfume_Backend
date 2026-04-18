require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/database');

const Admin       = require('../models/Admin');
const User        = require('../models/User');
const Product     = require('../models/Product');
const Blog        = require('../models/Blog');
const Store       = require('../models/Store');
const Testimonial = require('../models/Testimonial');
const Category    = require('../models/Category');
const Offer       = require('../models/Offer');
const Banner      = require('../models/Banner');
const Coupon      = require('../models/Coupon');
const Settings    = require('../models/Settings');

// ── Product data ───────────────────────────────────────────────
const DEFAULT_LINKS = {
  shopee:   'https://shopee.com.my/oud_alnood_kuala_lumpur',
  grab:     'https://grab.com.my/oud_alnood_kuala_lumpur',
  lalamove: 'https://lalamove.com/oud_alnood',
  jnt:      'https://jnt.com.my/tracking',
};

const PRODUCTS = [
  { name: { en: 'Kalakassi Oud Oil - New', ar: 'دهـن عود كالكاسي جديد' }, price: 375, category: 'oud', subcategory: 'oil', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800', description: { en: 'A rare and exquisite Kalakassi Oud, aged to perfection.', ar: 'دهن عود كالكاسي نادر وفاخر.' }, features: ['Aged 25+ Years', '100% Pure Organic', 'Long-lasting projection'], purchaseLinks: DEFAULT_LINKS, stock: 10, isFeatured: true },
  { name: { en: 'Cambodian 10 Yrs', ar: 'دهـن عود كمبودي ١٠ سنوات' }, price: 60, category: 'oud', subcategory: 'oil', image: 'https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?auto=format&fit=crop&q=80&w=800', description: { en: 'A classic Cambodian profile with 10 years of natural aging.', ar: 'بروفايل كمبودي كلاسيكي.' }, features: ['Wild Harvested', 'Sweet Fruity Profile', 'Daily wear elegance'], purchaseLinks: DEFAULT_LINKS, stock: 25 },
  { name: { en: 'Cambodian Old', ar: 'دهـن عود كمبودي قديم' }, price: 60, category: 'oud', subcategory: 'oil', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800', description: { en: 'Masterfully distilled from old-growth trees.', ar: 'مقطر ببراعة من أشجار قديمة النمو.' }, features: ['Traditional Distillation', 'Smoky Earthy Tones', 'Heritage collection'], purchaseLinks: DEFAULT_LINKS, stock: 18 },
  { name: { en: 'Hindi Turabi', ar: 'دهـن عود هندي ترابي' }, price: 150, category: 'oud', subcategory: 'oil', image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&q=80&w=800', description: { en: 'A legendary Indian Oud profile.', ar: 'بروفايل عود هندي أسطوري.' }, features: ['High Silage', 'Authentic Indian Assam', 'Spicy Heart Notes'], purchaseLinks: DEFAULT_LINKS, stock: 8, isFeatured: true },
  { name: { en: 'Royal Bakhoor Blend', ar: 'بخور ملكي مميز' }, price: 85, category: 'oud', subcategory: 'bakhoor', image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&q=80&w=800', description: { en: 'A rich bakhoor blend of oud chips, sandalwood, and amber.', ar: 'مزيج بخور غني.' }, features: ['Hand-blended', 'Natural Ingredients', 'Long burn time'], purchaseLinks: DEFAULT_LINKS, stock: 30 },
  { name: { en: 'Cambodian Oud Chips', ar: 'رقائق عود كمبودي' }, price: 220, category: 'oud', subcategory: 'chips', image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&q=80&w=800', description: { en: 'Premium Cambodian oud wood chips.', ar: 'رقائق عود كمبودي فاخرة.' }, features: ['Hand-selected', 'High Resin Content', 'Grade A+'], purchaseLinks: DEFAULT_LINKS, stock: 15 },
  { name: { en: 'Sultan Noir EDP', ar: 'سلطان نوار - ماء عطر' }, price: 195, category: 'perfumes', subcategory: 'men', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800', description: { en: 'A commanding masculine fragrance with oud, leather, and black pepper.', ar: 'عطر رجالي قوي.' }, features: ['Eau de Parfum', '100ml', '12+ hour longevity'], purchaseLinks: DEFAULT_LINKS, stock: 20, isFeatured: true },
  { name: { en: 'Amir Oud Intense', ar: 'أمير عود إنتنس' }, price: 245, category: 'perfumes', subcategory: 'men', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800', description: { en: 'An intense oud-based fragrance layered with saffron.', ar: 'عطر مكثف يعتمد على العود.' }, features: ['Eau de Parfum', '75ml', 'Saffron & Amber'], purchaseLinks: DEFAULT_LINKS, stock: 12 },
  { name: { en: 'Midnight Musk', ar: 'مسك منتصف الليل' }, price: 120, category: 'perfumes', subcategory: 'men', image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&q=80&w=800', description: { en: 'A smooth blend of white musk and bergamot.', ar: 'مزيج ناعم من المسك الأبيض.' }, features: ['Eau de Toilette', '100ml', 'Fresh & Woody'], purchaseLinks: DEFAULT_LINKS, stock: 22 },
  { name: { en: 'Rose Taifi Silk', ar: 'روز طائفي حرير' }, price: 185, category: 'perfumes', subcategory: 'women', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800', description: { en: 'A delicate feminine fragrance with Taifi rose.', ar: 'عطر نسائي رقيق.' }, features: ['Eau de Parfum', '50ml', 'Taifi Rose'], purchaseLinks: DEFAULT_LINKS, stock: 14 },
  { name: { en: 'Amira Gold', ar: 'أميرة ذهبية' }, price: 210, category: 'perfumes', subcategory: 'women', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800', description: { en: 'An opulent floral-oriental with jasmine and golden amber.', ar: 'عطر زهري شرقي فاخر.' }, features: ['Eau de Parfum', '75ml', 'Jasmine & Amber'], purchaseLinks: DEFAULT_LINKS, stock: 9 },
  { name: { en: 'Layla Musk', ar: 'ليلى مسك' }, price: 95, category: 'perfumes', subcategory: 'women', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800', description: { en: 'A soft, intimate musk with peony petals.', ar: 'مسك ناعم وحميمي.' }, features: ['Eau de Toilette', '100ml', 'Peony & Sandalwood'], purchaseLinks: DEFAULT_LINKS, stock: 16 },
  { name: { en: 'Oud Royale Unisex', ar: 'عود رويال يونيسكس' }, price: 280, category: 'perfumes', subcategory: 'unisex', image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&q=80&w=800', description: { en: 'A genderless masterpiece anchored in rare oud.', ar: 'تحفة بلا جنس.' }, features: ['Eau de Parfum', '100ml', 'Cardamom & Patchouli'], purchaseLinks: DEFAULT_LINKS, stock: 7 },
  { name: { en: 'Brass Oud Burner', ar: 'مبخرة نحاسية' }, price: 135, category: 'accessories', subcategory: 'burners', image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&q=80&w=800', description: { en: 'Handcrafted brass mabkhara with intricate patterns.', ar: 'مبخرة نحاسية مصنوعة يدوياً.' }, features: ['Handcrafted', 'Solid Brass', 'Geometric Design'], purchaseLinks: DEFAULT_LINKS, stock: 11 },
  { name: { en: 'Crystal Attar Bottle Set', ar: 'طقم زجاجات عطر كريستال' }, price: 75, category: 'accessories', subcategory: 'bottles', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800', description: { en: 'A set of 3 hand-blown crystal attar bottles.', ar: 'طقم من ٣ زجاجات عطر.' }, features: ['Set of 3', 'Hand-blown Crystal', 'Gold Caps'], purchaseLinks: DEFAULT_LINKS, stock: 20 },
  { name: { en: 'Luxury Gift Box', ar: 'صندوق هدايا فاخر' }, price: 45, category: 'accessories', subcategory: 'gifting', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238f7e7?auto=format&fit=crop&q=80&w=800', description: { en: 'Premium wooden gift box with velvet lining.', ar: 'صندوق هدايا خشبي فاخر.' }, features: ['Wooden Construction', 'Velvet Lined', 'Engravable'], purchaseLinks: DEFAULT_LINKS, stock: 35 },
];

const BLOG_POSTS = [
  { title: { en: 'The Art of Layering Oud', ar: 'فن وضع طبقات العود' }, excerpt: { en: 'Discover how to combine different oud oils for a truly unique signature scent...', ar: 'اكتشف كيفية الجمع بين زيوت العود المختلفة...' }, body: { en: 'Full article body here...', ar: 'محتوى المقال الكامل هنا...' }, image: 'https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?auto=format&fit=crop&q=80&w=800', tags: ['oud', 'tips', 'layering'], published: true },
  { title: { en: 'Sourcing the Finest Agarwood', ar: 'الحصول على أجود أنواع خشب العود' }, excerpt: { en: 'A journey into the deep jungles of Southeast Asia in search of liquid gold...', ar: 'رحلة إلى غابة جنوب شرق آسيا...' }, body: { en: 'Full article body here...', ar: 'محتوى المقال الكامل هنا...' }, image: 'https://images.unsplash.com/photo-1615484477201-9f4953340fab?auto=format&fit=crop&q=80&w=800', tags: ['agarwood', 'sourcing', 'heritage'], published: true },
];

const STORES = [
  { slug: 'bukit-bintang', name: { en: 'Bukit Bintang Boutique', ar: 'بوتيك بوكيت بينتانج' }, address: { en: 'Kiosk K15, Monorail Station, Kuala Lumpur', ar: 'كشك K15، محطة المونوريل، كوالالمبور' }, phone: '+60 3-1234 5678', mapEmbed: 'https://maps.google.com/maps?q=Bukit%20Bintang%20Kiosk%20K15&output=embed', navLink: 'https://www.google.com/maps/dir/?api=1&destination=Bukit%20Bintang', sortOrder: 1 },
  { slug: 'klcc', name: { en: 'Suria KLCC Boutique', ar: 'بوتيك سوريا KLCC' }, address: { en: 'Concourse Level, Suria KLCC, Kuala Lumpur', ar: 'طابق الكونكورس، سوريا KLCC' }, phone: '+60 3-2345 6789', mapEmbed: 'https://maps.google.com/maps?q=Suria%20KLCC&output=embed', navLink: 'https://www.google.com/maps/dir/?api=1&destination=Suria%20KLCC', sortOrder: 2 },
];

const TESTIMONIALS = [
  { name: 'Sarah J.', text: { en: 'The Cambodian Old oil is unlike anything I have ever smelled. Pure luxury.', ar: 'زيت كمبودي قديم لا يشبه أي شيء شممت رائحته من قبل.' }, rating: 5 },
  { name: 'Ahmed K.', text: { en: 'Authentic quality and exceptional service at the Bukit Bintang boutique.', ar: 'جودة أصلية وخدمة استثنائية.' }, rating: 5 },
  { name: 'Isabella R.', text: { en: 'A true sensory journey. The Kalakassi Oud is the crown jewel of my collection.', ar: 'رحلة حسية حقيقية.' }, rating: 5 },
  { name: 'Mohammad Al-Farris', text: { en: 'The depth of these fragrances is stunning. Perfection in every drop.', ar: 'عمق هذه العطور مذهل.' }, rating: 5 },
  { name: 'Chen Wee.', text: { en: 'Elegant, mysterious, and long-lasting. Exactly what I was looking for.', ar: 'أنيق، غامض، ويدوم طويلاً.' }, rating: 5 },
];

const CATEGORIES = [
  { slug: 'oud', name: { en: 'Oud', ar: 'عود' }, description: { en: 'Rare and aged oud oils, bakhoor, and chips.', ar: 'زيوت ورقائق العود النادرة.' }, sortOrder: 1 },
  { slug: 'perfumes', name: { en: 'Perfumes', ar: 'عطور' }, description: { en: 'Signature fragrances for men, women, and unisex.', ar: 'عطور مميزة.' }, sortOrder: 2 },
  { slug: 'accessories', name: { en: 'Accessories', ar: 'إكسسوارات' }, description: { en: 'Burners, bottles and gift boxes.', ar: 'مباخر وزجاجات.' }, sortOrder: 3 },
];

const BANNERS = [
  { section: 'hero', title: { en: 'Timeless Elegance', ar: 'أناقة خالدة' }, subtitle: { en: 'Discover the art of oud', ar: 'اكتشف فن العود' }, image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&q=80&w=1600', ctaText: { en: 'Shop Now', ar: 'تسوق الآن' }, ctaLink: '/shop', sortOrder: 1 },
  { section: 'promo', title: { en: 'Wholesale Inquiries Welcome', ar: 'استفسارات الجملة' }, image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&q=80&w=1600', ctaText: { en: 'Contact Us', ar: 'تواصل معنا' }, ctaLink: '/contact' },
];

const OFFERS = [
  { title: { en: 'Ramadan Special', ar: 'عرض رمضان' }, description: { en: '15% off all oud oils', ar: 'خصم 15%' }, discountType: 'percentage', discountValue: 15, badge: 'RAMADAN', image: 'https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?auto=format&fit=crop&q=80&w=800', isActive: true },
  { title: { en: 'Bundle & Save', ar: 'وفر مع الباقات' }, description: { en: 'Buy 2 perfumes, get 1 free', ar: 'اشترِ 2 واحصل على 1 مجاناً' }, discountType: 'bogo', discountValue: 0, badge: 'BUNDLE', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800', isActive: true },
];

const COUPONS = [
  { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderAmount: 100, description: 'Welcome offer — 10% off first order' },
  { code: 'FLAT50', discountType: 'fixed', discountValue: 50, minOrderAmount: 300, description: 'RM50 off orders above RM300' },
];

const seed = async () => {
  await connectDB();
  console.log('\n🌱 Starting database seed...\n');

  // ── Admin ──────────────────────────────────────────────────
  const existingAdmin = await Admin.findOne({ email: 'admin@oudalnood.com' });
  if (!existingAdmin) {
    await Admin.create({ name: 'Super Admin', email: 'admin@oudalnood.com', password: 'Admin@1234', role: 'superadmin' });
    console.log('✅ Admin created: admin@oudalnood.com / Admin@1234');
  } else console.log('ℹ️  Admin already exists, skipping.');

  // ── Demo customer ──────────────────────────────────────────
  if (!(await User.findOne({ email: 'customer@example.com' }))) {
    await User.create({ name: 'Demo Customer', email: 'customer@example.com', password: 'Customer@123', phone: '+60 12-345 6789' });
    console.log('✅ Demo customer: customer@example.com / Customer@123');
  }

  // ── Products ───────────────────────────────────────────────
  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(PRODUCTS);
    console.log(`✅ ${PRODUCTS.length} products seeded`);
  } else console.log('ℹ️  Products already exist.');

  // ── Blog ───────────────────────────────────────────────────
  if ((await Blog.countDocuments()) === 0) {
    const admin = await Admin.findOne({ email: 'admin@oudalnood.com' });
    for (const p of BLOG_POSTS) {
      await Blog.create({ ...p, author: admin._id });
    }
    console.log(`✅ ${BLOG_POSTS.length} blog posts seeded`);
  }

  // ── Stores ─────────────────────────────────────────────────
  if ((await Store.countDocuments()) === 0) {
    await Store.insertMany(STORES);
    console.log(`✅ ${STORES.length} stores seeded`);
  }

  // ── Testimonials ───────────────────────────────────────────
  if ((await Testimonial.countDocuments()) === 0) {
    await Testimonial.insertMany(TESTIMONIALS);
    console.log(`✅ ${TESTIMONIALS.length} testimonials seeded`);
  }

  // ── Categories ─────────────────────────────────────────────
  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany(CATEGORIES);
    console.log(`✅ ${CATEGORIES.length} categories seeded`);
  }

  // ── Banners ────────────────────────────────────────────────
  if ((await Banner.countDocuments()) === 0) {
    await Banner.insertMany(BANNERS);
    console.log(`✅ ${BANNERS.length} banners seeded`);
  }

  // ── Offers ─────────────────────────────────────────────────
  if ((await Offer.countDocuments()) === 0) {
    await Offer.insertMany(OFFERS);
    console.log(`✅ ${OFFERS.length} offers seeded`);
  }

  // ── Coupons ────────────────────────────────────────────────
  if ((await Coupon.countDocuments()) === 0) {
    await Coupon.insertMany(COUPONS);
    console.log(`✅ ${COUPONS.length} coupons seeded`);
  }

  // ── Settings ───────────────────────────────────────────────
  if (!(await Settings.findOne({ key: 'global' }))) {
    await Settings.create({
      key: 'global',
      siteName: { en: 'Oud Al-Anood', ar: 'عود العنود' },
      tagline: { en: 'Where Heritage Meets Luxury', ar: 'حيث يلتقي التراث بالفخامة' },
      contactEmail: 'hello@oudalnood.com',
      contactPhone: '+60 3-1234 5678',
      whatsapp: '+60123456789',
      social: { instagram: 'https://instagram.com/oudalnood', facebook: 'https://facebook.com/oudalnood' },
      currency: 'MYR', currencySymbol: 'RM',
      wholesaleDiscountPercent: 30,
    });
    console.log('✅ Settings seeded');
  }

  console.log('\n✅ Seed complete!\n');
  console.log('   Admin    → admin@oudalnood.com / Admin@1234');
  console.log('   Customer → customer@example.com / Customer@123\n');
  process.exit(0);
};

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
