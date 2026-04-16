import Product from '../models/Product.js';

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Fetch all products (with optional search, category, concern, featured, active filters)
// @route   GET /api/v1/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const query = {};

    // Active filter (default: show only active for public, show all for admin)
    if (req.query.active === 'true') {
      query.isActive = true;
    } else if (req.query.active === 'false') {
      query.isActive = false;
    }
    // If no active param, return all (admin needs to see inactive too)

    // Category filter
    if (req.query.category) {
      query.category = { $regex: new RegExp(`^${escapeRegex(req.query.category)}$`, 'i') };
    }

    // Concern filter
    if (req.query.concern) {
      query.concern = { $regex: new RegExp(escapeRegex(req.query.concern), 'i') };
    }

    // Featured filter
    if (req.query.featured === 'true') {
      query.isFeatured = true;
      query.isActive = true;
      query.inventory = { $gt: 0 };
    }

    // Text search — use regex prefix for short queries, $text for longer
    const searchTerm = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (searchTerm) {
      if (searchTerm.length < 3) {
        // Short queries: prefix match on title (case-insensitive)
        query.title = { $regex: new RegExp(`^${escapeRegex(searchTerm)}`, 'i') };
      } else {
        // Longer queries: also use regex for partial/prefix matching
        query.title = { $regex: new RegExp(escapeRegex(searchTerm), 'i') };
      }
    }

    let productsQuery = Product.find(query);

    // If text search, sort alphabetically by title
    if (searchTerm) {
      productsQuery = productsQuery.sort({ title: 1 });
    } else if (req.query.featured === 'true') {
      // Randomize featured products
      const count = parseInt(req.query.limit) || 8;
      const products = await Product.aggregate([
        { $match: query },
        { $sample: { size: count } }
      ]);
      return res.json(products);
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    // Pagination
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      const page = parseInt(req.query.page) || 1;
      productsQuery = productsQuery.skip((page - 1) * limit).limit(limit);
    }

    const products = await productsQuery;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/v1/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product by slug
// @route   GET /api/v1/products/by-slug/:slug
// @access  Public
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { title, slug, price, originalPrice, description, images, category, concern, inventory, isActive, isFeatured } = req.body;
    
    const productTitle = title || 'Sample name';
    
    const product = new Product({
      title: productTitle,
      slug: slug || productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      price: price !== undefined ? price : 0,
      originalPrice: originalPrice !== undefined ? originalPrice : 0,
      description: description || 'Sample description',
      images: images && images.length > 0 ? images : ['/images/sample.jpg'],
      category: category || 'General',
      concern: concern || 'General',
      inventory: inventory !== undefined ? inventory : 0,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { title, slug, price, originalPrice, description, images, category, concern, inventory, isActive, isFeatured } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Use explicit undefined checks so 0 and false are valid values
      if (title !== undefined) product.title = title;
      if (slug !== undefined) product.slug = slug;
      if (price !== undefined) product.price = price;
      if (originalPrice !== undefined) product.originalPrice = originalPrice;
      if (description !== undefined) product.description = description;
      if (images !== undefined) product.images = images;
      if (category !== undefined) product.category = category;
      if (concern !== undefined) product.concern = concern;
      if (inventory !== undefined) product.inventory = inventory;
      if (isActive !== undefined) product.isActive = isActive;
      if (isFeatured !== undefined) product.isFeatured = isFeatured;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product stock
// @route   PATCH /api/v1/products/:id/stock
// @access  Private/Admin
export const updateProductStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.inventory = req.body.stock !== undefined ? req.body.stock : product.inventory;
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
