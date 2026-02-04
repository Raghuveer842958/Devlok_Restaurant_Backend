const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");  // ✅ ADD THIS LINE
require("dotenv").config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.send("Restaurant backend running");
});

app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes working fine"
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/item", require("./routes/itemRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));

app.use("/uploads", express.static("uploads"));

console.log("mongo uri is :", process.env.MONGO_URI);

// ✅ Move MongoDB connection BEFORE listen()
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

const PORT = process.env.PORT || 3000;  // ✅ Fallback port

// ✅ Listen AFTER connection setup
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});