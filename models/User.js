// const mongoose = require("mongoose");

// module.exports = mongoose.model(
//   "User",
//   new mongoose.Schema(
//     {
//       name: String,
//       email: { type: String, unique: true, required: true }, // ✅ Changed
//       role: { type: String, enum: ["admin", "staff"], default: "staff" },
//       isActive: { type: Boolean, default: true },
//       isEmailVerified: { type: Boolean, default: false }, // ✅ OTP verification
//     },
//     { timestamps: true },
//   ),
// );





const mongoose = require("mongoose");

module.exports = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name: String,
      email: { type: String, unique: true, required: true },
      password: String,  // ✅ ADD THIS - Missing!
      role: { type: String, enum: ["admin", "staff"], default: "staff" },
      isActive: { type: Boolean, default: true },
      isEmailVerified: { type: Boolean, default: false },
      
      // ✅ CRITICAL: OTP FIELDS - These were MISSING!
      tempOTP: String,
      tempOTPExpires: Date,
    },
    { timestamps: true }
  )
);