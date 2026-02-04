const Category = require("../models/Category");

const add = async (req, res) => {
  try {
    console.log("add category called");
    const { name, isActive = true } = req.body;

    if (!name) {
      console.log("Category name is missing");
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

    const image = req.file ? req.file.path : null;

    const category = await Category.create({
      name,
      slug,
      isActive,
      image,
    });

    console.log("Category created:", category);

    res.status(201).json({
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    /* 🚨 HANDLE DUPLICATE KEY ERROR */
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    console.error("Error adding category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select("name slug image isActive")
      .sort({ createdAt: 1 });

    res.status(200).json({
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const updateData = {};

    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().trim().replace(/\s+/g, "-");
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (req.file) {
      updateData.image = req.file.path;
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Category name already exists",
      });
    }

    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    console.log("Category deleted:", category.name);

    res.status(200).json({
      message: "Category deleted successfully",
      category,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  add,
  get,
  update,
  remove,
};
