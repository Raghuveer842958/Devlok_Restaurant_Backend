// // controllers/orderController.js
// const Order = require("../models/Order");
// const mongoose = require("mongoose");

// const nodemailer = require('nodemailer');
// require('dotenv').config();

// // Email transporter setup
// const transporter = nodemailer.createTransporter({
//   service: 'gmail',
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS
//   }
// });

// // ✅ Email notification function
// const sendOrderEmail = async (email, orderNo, status, totalAmount) => {
//   if (!email) return;

//   const statusEmojis = {
//     'PLACED': '📝',
//     'PREPARING': '🍳', 
//     'SERVED': '✅',
//     'CANCELLED': '❌'
//   };

//   const mailOptions = {
//     from: `"Restaurant App" <${process.env.GMAIL_USER}>`,
//     to: email,
//     subject: `Order ${orderNo.slice(-8)} - ${status}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #10b981;">${statusEmojis[status]} Order Update</h2>
//         <p><strong>Order No:</strong> ${orderNo.slice(-8)}</p>
//         <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">${status}</span></p>
//         <p><strong>Total:</strong> ₹${totalAmount}</p>
        
//         <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
//           <p>Thank you for choosing us! 🍽️</p>
//         </div>
        
//         <p style="color: #6b7280; font-size: 12px;">
//           This is an automated message from Restaurant App.
//         </p>
//       </div>
//     `
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Email sent to ${email}`);
//   } catch (error) {
//     console.error('❌ Email failed:', error);
//   }
// };

// // ✅ UPDATE STATUS with Email
// const updateStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     order.orderStatus = status;
//     order.statusHistory.push({ status });
//     await order.save();

//     // ✅ SEND EMAIL NOTIFICATION
//     if (order.customer?.email) {
//       await sendOrderEmail(
//         order.customer.email, 
//         order.orderNo, 
//         status, 
//         order.totalAmount
//       );
//     }

//     res.json({ 
//       message: "Status updated", 
//       order,
//       emailSent: !!order.customer?.email 
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // CREATE ORDER
// const create = async (req, res) => {
//   try {
//     const { items, totalAmount, customer, paymentMethod } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({ message: "Order items required" });
//     }

//     if (!customer?.name || !customer?.phone) {
//       return res.status(400).json({ message: "Customer details required" });
//     }

//     if (!paymentMethod) {
//       return res.status(400).json({ message: "Payment method required" });
//     }

//     const order = await Order.create({
//       orderNo: `ORD-${Date.now()}`,
//       items,
//       totalAmount,
//       customer,
//       paymentMethod,
//       createdBy: req.user?.id || null,
//       statusHistory: [{ status: "PLACED" }],
//     });

//     // 🔔 USER NOTIFICATION HOOK (future)
//     notifyUser(order.createdBy, "Order placed successfully", order);

//     res.status(201).json({
//       message: "Order placed successfully",
//       order,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // GET ORDERS (Admin / Staff / User)
// const get = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate("createdBy", "name phone role")
//       .populate("items.itemId", "name");

//     res.status(200).json({ orders });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };

// // UPDATE ORDER STATUS + USER NOTIFICATION
// const updateStatus2 = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid order id" });
//     }

//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     order.orderStatus = status;
//     order.statusHistory.push({ status });

//     await order.save();

//     // 🔔 USER NOTIFICATION
//     notifyUser(order.createdBy, `Order status updated to ${status}`, order);

//     res.status(200).json({
//       message: "Order status updated",
//       order,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to update status" });
//   }
// };

// const notifyUser = async (phone, message, order) => {
//   try {
//     const response = await client.sendSms([phone], {
//       message: message,
//       sender: 'RESTRNT' // Your sender ID
//     });
//     console.log('SMS sent:', response);
//   } catch (error) {
//     console.error('SMS failed:', error);
//   }
// };

// // Add this to your existing orderController.js
// const deleteOrder = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid order ID" });
//     }

//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     await Order.findByIdAndDelete(id);

//     res.status(200).json({
//       message: "Order deleted successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = {
//   create,
//   get,
//   updateStatus,
//   deleteOrder, // ✅ Add this
// };









const Order = require("../models/Order");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
require('dotenv').config();

// ✅ Email transporter (Gmail)
const transporter = nodemailer.createTransport({  // ✅ Correct method name
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});


// ✅ Email notification function
const sendOrderEmail = async (email, orderNo, status, totalAmount) => {
  console.log("Preparing to send email to:", email);
  if (!email) return;

  const statusEmojis = {
    'PLACED': '📝',
    'PREPARING': '🍳', 
    'SERVED': '✅',
    'CANCELLED': '❌'
  };

  const mailOptions = {
    from: `"Restaurant App" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Order ${orderNo.slice(-8)} - ${status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">${statusEmojis[status] || '📋'} Order Update</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order No:</strong> ${orderNo.slice(-8)}</p>
          <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">${status}</span></p>
          <p><strong>Total Amount:</strong> <span style="color: #10b981;">₹${totalAmount}</span></p>
        </div>
        <p style="color: #64748b;">Thank you for choosing our restaurant! 🍽️</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px;">
          This is an automated message from Restaurant App.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
};

// ✅ CREATE ORDER
const create = async (req, res) => {
  console.log("Creating order with data:", req.body);
  try {
    const { items, totalAmount, customer, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items required" });
    }

    // if (!customer?.name || !customer?.phone) {
    //   return res.status(400).json({ message: "Customer details required" });
    // }

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method required" });
    }

    const order = await Order.create({
      orderNo: `ORD-${Date.now()}`,
      items,
      totalAmount,
      customer,
      paymentMethod,
      createdBy: req.user?.id || null,
      statusHistory: [{ status: "PLACED" }],
    });

    // ✅ SEND ORDER CONFIRMATION EMAIL
    if (customer?.email) {
      console.log("Sending order confirmation email to:", customer.email);
      await sendOrderEmail(customer.email, order.orderNo, 'PLACED', totalAmount);
    }

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET ORDERS
const get = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("createdBy", "name phone role")
      .populate("items.itemId", "name");

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ✅ UPDATE STATUS (Main function - REMOVE updateStatus2)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    order.statusHistory.push({ status });
    await order.save();

    // ✅ SEND STATUS UPDATE EMAIL
    if (order.customer?.email) {
      await sendOrderEmail(
        order.customer.email, 
        order.orderNo, 
        status, 
        order.totalAmount
      );
    }

    res.json({ 
      message: "Status updated", 
      order,
      emailSent: !!order.customer?.email 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE ORDER
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ EXPORTS - Clean & Complete
module.exports = {
  create,
  get,
  updateStatus,      // ✅ Main status function
  deleteOrder,
};
