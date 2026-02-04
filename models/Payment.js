const mongoose = require("mongoose");

module.exports = mongoose.model("Payment", new mongoose.Schema({
  orderId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  method: String,
  status: String
}, { timestamps: true }));
