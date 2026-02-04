const Item = require("../models/Item");
const Category = require("../models/Category");
const mongoose = require("mongoose");

// Add item (admin only) - Handles image upload + required fields only
const add = async (req, res) => {
  try {
    const { name, categoryId, price, details } = req.body;

    // Validation
    if (!name || !categoryId || !price || !details) {
      return res.status(400).json({ 
        message: "Missing required fields: name, categoryId, price, details" 
      });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Generate slug
    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

    // Check duplicate slug
    const existing = await Item.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: "Item name already exists" });
    }

    const item = new Item({
      name: name.trim(),
      slug,
      price: parseFloat(price),
      categoryId,
      image: req.file ? req.file.path : null,
      details: details.trim(),
    });

    const savedItem = await item.save();

    res.status(201).json({
      message: "Item added successfully",
      item: savedItem,
    });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get items (Public - for home screen)
const get = async (req, res) => {
  try {
    const items = await Item.find({ isAvailable: true })
      .populate("categoryId", "name slug")
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Items fetched successfully",
      items,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get items by category (Public)
const getById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const items = await Item.find({
      categoryId: new mongoose.Types.ObjectId(categoryId),
      isAvailable: true,
    })
    .populate("categoryId", "name")
    .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Items fetched successfully",
      items,
    });
  } catch (error) {
    console.error("Error fetching items by category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update item (admin only)
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, details, isAvailable } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name.trim();
      updateData.slug = name.toLowerCase().trim().replace(/\s+/g, "-");
    }
    if (price) updateData.price = parseFloat(price);
    if (details !== undefined) updateData.details = details.trim();
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (req.file) updateData.image = req.file.path;

    const updatedItem = await Item.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({
      message: "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByIdAndDelete(id);
    
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    res.status(200).json({
      message: "Item deleted successfully",
      item,
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  add,
  get,
  getById,
  update,
  remove
};
