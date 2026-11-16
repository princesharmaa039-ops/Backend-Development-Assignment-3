const Product = require('../models/Product');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const httpError = (status, msg) => {
  const e = new Error(msg);
  e.statusCode = status;
  return e;
};

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ALLOWED_SORT = ['name', 'price', 'quantity', 'category', 'createdAt', 'updatedAt'];
const WRITABLE = ['name', 'sku', 'category', 'price', 'quantity', 'reorderLevel', 'supplier'];

const pick = (obj, keys) =>
  keys.reduce((acc, k) => (obj[k] !== undefined ? { ...acc, [k]: obj[k] } : acc), {});

// POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(pick(req.body, WRITABLE));
  res.status(201).json(product);
});

// GET /api/products?category=&supplier=&search=&minPrice=&maxPrice=&inStock=&sort=&page=&limit=
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, supplier, search, minPrice, maxPrice, inStock, sort } = req.query;
  const filter = {};

  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  if (supplier) filter.supplier = new RegExp(escapeRegex(supplier), 'i');
  if (search) filter.name = new RegExp(escapeRegex(search), 'i');

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) {
      if (isNaN(minPrice)) throw httpError(400, 'minPrice must be a number');
      filter.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined) {
      if (isNaN(maxPrice)) throw httpError(400, 'maxPrice must be a number');
      filter.price.$lte = Number(maxPrice);
    }
  }

  if (inStock === 'true') filter.quantity = { $gt: 0 };
  if (inStock === 'false') filter.quantity = 0;

  // sort=-price,name  (whitelisted fields only)
  let sortBy = '-createdAt';
  if (sort) {
    const fields = sort.split(',').map((f) => f.trim()).filter(Boolean);
    const invalid = fields.find((f) => !ALLOWED_SORT.includes(f.replace(/^-/, '')));
    if (invalid) throw httpError(400, `Cannot sort by "${invalid}". Allowed: ${ALLOWED_SORT.join(', ')}`);
    sortBy = fields.join(' ');
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort(sortBy).skip((page - 1) * limit).limit(limit),
  ]);

  res.json({
    total,
    page,
    totalPages: Math.ceil(total / limit),
    count: products.length,
    products,
  });
});

// GET /api/products/:id
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw httpError(404, 'Product not found');
  res.json(product);
});

// PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body, WRITABLE), {
    new: true,
    runValidators: true,
  });
  if (!product) throw httpError(404, 'Product not found');
  res.json(product);
});

// PATCH /api/products/:id/stock   body: { "change": 10 }  (+ restock, - sale)
exports.adjustStock = asyncHandler(async (req, res) => {
  const { change } = req.body;

  // Atomic: the quantity >= -change condition and $inc happen in one operation,
  // so concurrent sales can never push stock below zero.
  const filter = { _id: req.params.id };
  if (change < 0) filter.quantity = { $gte: -change };

  const product = await Product.findOneAndUpdate(filter, { $inc: { quantity: change } }, { new: true });

  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    if (!exists) throw httpError(404, 'Product not found');
    throw httpError(400, 'Insufficient stock for this sale');
  }

  res.json({ message: 'Stock updated', product });
});

// DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw httpError(404, 'Product not found');
  res.json({ message: 'Product deleted', id: product.id });
});

// GET /api/products/low-stock   (quantity <= reorderLevel)
exports.getLowStock = asyncHandler(async (req, res) => {
  const lowStockItems = await Product.aggregate([
    { $match: { $expr: { $lte: ['$quantity', '$reorderLevel'] } } },
    { $addFields: { id: { $toString: '$_id' }, stockValue: { $multiply: ['$price', '$quantity'] } } },
    { $sort: { quantity: 1 } },
  ]);
  res.json({ count: lowStockItems.length, lowStockItems });
});

// GET /api/products/summary   (category-wise aggregation)
exports.getSummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        avgPrice: { $avg: '$price' },
      },
    },
    { $sort: { totalStockValue: -1 } },
  ]);
  res.json({ categories: summary.length, summary });
});
