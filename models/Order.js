// models/Order.js
const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Order",
  new mongoose.Schema(
    {
      orderNo: {
        type: String,
        unique: true,
      },

      items: [
        {
          itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
          price: {
            type: Number, // snapshot price
            required: true,
          },
        },
      ],

      totalAmount: {
        type: Number,
        required: true,
      },

      customer: {
        name: { type: String, required: true },
        phone: { type: String},
        email: { type: String, required: true },
        tableNo: { type: String },
      },

      paymentMethod: {
        type: String,
        enum: ["CASH", "UPI", "CARD"],
        required: true,
      },

      paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID"],
        default: "PENDING",
      },

      orderStatus: {
        type: String,
        enum: ["PLACED", "PREPARING", "SERVED", "CANCELLED"],
        default: "PLACED",
      },

      statusHistory: [
        {
          status: String,
          updatedAt: { type: Date, default: Date.now },
        },
      ],

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    },
    { timestamps: true }
  )
);
