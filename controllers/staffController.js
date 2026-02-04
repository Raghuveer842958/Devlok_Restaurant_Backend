const User = require("../models/User");

// Get all staff members
const get = async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" });
    res.status(200).json({ message: "Staff fetched successfully", staff });
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update staff member
const update = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedStaff = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res
      .status(200)
      .json({ message: "Staff updated successfully", staff: updatedStaff });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete staff member
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStaff = await User.findByIdAndDelete(id);

    if (!deletedStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res
      .status(200)
      .json({ message: "Staff deleted successfully", staff: deletedStaff });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get,
  update,
  remove,
};
