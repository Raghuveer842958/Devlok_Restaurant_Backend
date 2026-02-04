const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Item = require("../models/Item");

const pay = async (req, res) => {
  try {
    const { orderId, method } = req.body;

    if (!orderId || !method) {
      return res.status(400).json({ message: "orderId and method are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ message: "Order already paid" });
    }

    let totalAmount = 0;

    for (const orderItem of order.items) {
      const item = await Item.findById(orderItem.itemId);
      if (!item) {
        return res.status(400).json({ message: "Invalid item in order" });
      }
      totalAmount += item.price * orderItem.quantity;
    }

    const payment = await Payment.create({
      orderId,
      amount: totalAmount,
      method,
      status: "SUCCESS",
      paidBy: req.user.id
    });

    order.paymentStatus = "PAID";
    order.totalAmount = totalAmount;
    await order.save();

    res.status(200).json({
      message: "Payment successful",
      amountCharged: totalAmount,
      payment
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { pay };
