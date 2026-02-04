const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
    },

    image: {
      type: String, // stored filename or relative path
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* 🚨 STRONG UNIQUE INDEX (case-insensitive) */
categorySchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

categorySchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
