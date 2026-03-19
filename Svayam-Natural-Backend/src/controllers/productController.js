import Product from '../models/Product.js';

// @desc    Fetch all products
// @route   GET /api/v1/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
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

// @desc    Create a product
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { title, slug, price, originalPrice, description, images, category, concern, inventory } = req.body;
    
    const productTitle = title || 'Sample name';
    
    const product = new Product({
      title: productTitle,
      slug: slug || productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      price: price || 0,
      originalPrice: originalPrice || 0,
      description: description || 'Sample description',
      images: images && images.length > 0 ? images : ['/images/sample.jpg'],
      category: category || 'General',
      concern: concern || 'General',
      inventory: inventory || 0,
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
  const { title, slug, price, originalPrice, description, images, category, concern, inventory } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.title = title || product.title;
      product.slug = slug || product.slug;
      product.price = price || product.price;
      product.originalPrice = originalPrice || product.originalPrice;
      product.description = description || product.description;
      product.images = images || product.images;
      product.category = category || product.category;
      product.concern = concern || product.concern;
      product.inventory = inventory || product.inventory;

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
