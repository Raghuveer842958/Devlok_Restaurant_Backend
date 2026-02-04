const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Item",
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      price: { type: Number, required: true },
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
      image: { type: String }, // From multer upload
      details: { type: String, required: true },
      isAvailable: { type: Boolean, default: true },
    },
    { timestamps: true },
  ),
);
