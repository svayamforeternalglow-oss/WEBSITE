import Category from '../models/Category.js';
import Concern from '../models/Concern.js';
import Product from '../models/Product.js';

// ── Categories ──────────────────────────────────────────

export const getCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;
    const categories = await Category.find(filter).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      isActive: isActive !== undefined ? isActive : true,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description, isActive } = req.body;
    if (name !== undefined) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if products reference this category
    const productCount = await Product.countDocuments({ category: { $regex: new RegExp(`^${category.name}$`, 'i') } });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete: ${productCount} product(s) still use this category. Reassign them first.` 
      });
    }

    await Category.deleteOne({ _id: category._id });
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Concerns ──────────────────────────────────────────

export const getConcerns = async (req, res) => {
  try {
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;
    const concerns = await Concern.find(filter).sort({ name: 1 });
    res.json(concerns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createConcern = async (req, res) => {
  try {
    const { name, image, isActive } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Concern.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Concern already exists' });
    }

    const concern = await Concern.create({
      name,
      slug,
      image: image || '',
      isActive: isActive !== undefined ? isActive : true,
    });
    res.status(201).json(concern);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateConcern = async (req, res) => {
  try {
    const concern = await Concern.findById(req.params.id);
    if (!concern) {
      return res.status(404).json({ message: 'Concern not found' });
    }

    const { name, image, isActive } = req.body;
    if (name !== undefined) {
      concern.name = name;
      concern.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (image !== undefined) concern.image = image;
    if (isActive !== undefined) concern.isActive = isActive;

    const updated = await concern.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteConcern = async (req, res) => {
  try {
    const concern = await Concern.findById(req.params.id);
    if (!concern) {
      return res.status(404).json({ message: 'Concern not found' });
    }

    // Check if products reference this concern
    const productCount = await Product.countDocuments({ concern: { $regex: new RegExp(concern.name, 'i') } });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete: ${productCount} product(s) still use this concern. Reassign them first.`
      });
    }

    await Concern.deleteOne({ _id: concern._id });
    res.json({ message: 'Concern removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
