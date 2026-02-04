// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");

// // User signup
// const signup = async (req, res) => {
//   try {
//     if (!req.body) {
//       return res.status(400).json({ message: "Request body missing" });
//     }

//     const { name, phone, password, role } = req.body;

//     if (!name || !phone || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const existingUser = await User.findOne({ phone });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ message: "User already exists with this phone" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       phone,
//       password: hashedPassword,
//       role: role || "staff",
//     });

//     res.status(201).json({
//       message: "User created successfully",
//       user,
//     });
//   } catch (error) {
//     console.error("Error signing up user:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // User login
// const login = async (req, res) => {
//   console.log("Login request body:", req.body);
//   try {
//     const { phone, password } = req.body;

//     if (!phone || !password) {
//       return res
//         .status(400)
//         .json({ message: "Phone and password are required" });
//     }

//     const user = await User.findOne({ phone });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "30m" },
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user,
//     });
//   } catch (error) {
//     console.error("Error logging in user:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // User logout
// const logout = async (req, res) => {
//   try {
//     res.status(200).json({ message: "Logged out successfully" });
//   } catch (error) {
//     console.error("Error logging out user:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // Email transporter (use Gmail/Outlook)
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER, // your-email@gmail.com
//     pass: process.env.EMAIL_PASS, // your-app-password
//   },
// });

// // Generate 6-digit OTP
// const generateOTP = () =>
//   Math.floor(100000 + Math.random() * 900000).toString();

// // Send OTP via email
// const sendOTP = async (email, otp) => {
//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Your Restaurant Admin OTP",
//     html: `
//       <h2>Your OTP Code</h2>
//       <h1 style="font-size: 48px;">${otp}</h1>
//       <p>Valid for 5 minutes. Do not share.</p>
//     `,
//   });
// };

// // 1. Send OTP
// const sendOTPCode = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: "Email required" });
//     }

//     // Check if user exists or create new
//     let user = await User.findOne({ email });
//     if (!user) {
//       user = await User.create({
//         name: email.split("@")[0], // Use email prefix as name
//         email,
//         role: "staff",
//       });
//     }

//     const otp = generateOTP();
//     const otpExpires = Date.now() + 5 * 60 * 1000; // 5 min

//     // Store OTP in user (or use Redis for production)
//     user.tempOTP = otp;
//     user.tempOTPExpires = otpExpires;
//     await user.save();

//     await sendOTP(email, otp);

//     res.json({ message: "OTP sent to your email" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // 2. Verify OTP + Login
// const verifyOTPLogin = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });
//     if (!user || !user.tempOTP || user.tempOTPExpires < Date.now()) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     if (user.tempOTP !== otp) {
//       return res.status(400).json({ message: "Wrong OTP" });
//     }

//     // Clear OTP
//     user.tempOTP = null;
//     user.tempOTPExpires = null;
//     user.isEmailVerified = true;
//     await user.save();

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "30m" },
//     );

//     res.json({
//       message: "Login successful",
//       token,
//       user: { id: user._id, email: user.email, role: user.role },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // 1. LOGIN OTP - Email + Password → Send OTP
// const loginOTP = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password required" });
//     }

//     // Find user by email (update your User model to have email field first)
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const otp = generateOTP();
//     user.tempOTP = otp;
//     user.tempOTPExpires = Date.now() + 5 * 60 * 1000;
//     await user.save();

//     await sendOTP(email, otp);
//     res.json({ message: "Login OTP sent" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // 2. SIGNUP OTP - Name + Email + Password → Send OTP
// const signupOTP = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password || password.length < 6) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = generateOTP();

//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//       role: "staff",
//       tempOTP: otp,
//       tempOTPExpires: Date.now() + 5 * 60 * 1000,
//     });
//     await user.save();

//     await sendOTP(email, otp);
//     res.json({ message: "Signup OTP sent" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // 3. VERIFY LOGIN OTP
// const verifyLoginOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const user = await User.findOne({ email });

//     if (!user || user.tempOTP !== otp || user.tempOTPExpires < Date.now()) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     // Clear OTP + Generate JWT
//     user.tempOTP = null;
//     user.tempOTPExpires = null;
//     await user.save();

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "30m" },
//     );
//     res.json({
//       message: "Login successful",
//       token,
//       user: { id: user._id, email, role: user.role },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // 4. VERIFY SIGNUP OTP
// const verifySignupOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const user = await User.findOne({ email });

//     if (!user || user.tempOTP !== otp || user.tempOTPExpires < Date.now()) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     user.tempOTP = null;
//     user.tempOTPExpires = null;
//     user.isEmailVerified = true;
//     await user.save();

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "30m" },
//     );
//     res.json({
//       message: "Signup successful",
//       token,
//       user: { id: user._id, email, role: user.role },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ ADD TO YOUR module.exports:
// module.exports = {
//   signup,
//   login,
//   logout,
//   sendOTPCode,
//   verifyOTPLogin, // Keep existing
//   loginOTP,
//   signupOTP,
//   verifyLoginOTP,
//   verifySignupOTP, // Add new
// };

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// TEMP: Mock OTP = 123456 for testing (remove later)
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // ✅ Fix: Use EMAIL_USER (not GMAIL_USER)
    pass: process.env.GMAIL_PASS,
  },
});

const sendOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your Restaurant Admin OTP Code ✅",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Your OTP Code</h2>
          <div style="background: #10b981; color: white; font-size: 48px; font-weight: bold; 
                      text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 10px;">
            ${otp}
          </div>
          <p style="color: #666; margin-top: 20px;">
            This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            Restaurant Admin App
          </p>
        </div>
      `,
    });
    console.log(`✅ Real OTP ${otp} sent to ${email}`);
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

// 1. LOGIN OTP
const loginOTP = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const otp = generateOTP();
    user.tempOTP = otp;
    user.tempOTPExpires = Date.now() + 5 * 60 * 1000; // 5min
    await user.save();

    await sendOTP(email, otp);
    res.json({ message: "Login OTP sent to your email" });
  } catch (error) {
    console.error("Login OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. SIGNUP OTP
const signupOTP = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email || !password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Name, email required. Password min 6 chars" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const user = new User({
      name: name.trim(),
      email,
      password: hashedPassword,
      role: "staff",
      tempOTP: otp,
      tempOTPExpires: Date.now() + 5 * 60 * 1000,
      isEmailVerified: false,
    });
    await user.save();

    await sendOTP(email, otp);
    res.status(201).json({ message: "Signup OTP sent to your email" });
  } catch (error) {
    console.error("Signup OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Keep verifyLoginOTP & verifySignupOTP same as before...
const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    console.log("🔍 Login OTP Debug:", {
      received: otp,
      stored: user?.tempOTP,
      expired: user?.tempOTPExpires < Date.now(),
    });

    if (
      !user ||
      !user.tempOTP ||
      user.tempOTP !== otp ||
      user.tempOTPExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.tempOTP = null;
    user.tempOTPExpires = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30m" },
    );
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify login OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    console.log("🔍 Signup OTP Debug:", {
      received: otp,
      stored: user?.tempOTP,
      expired: user?.tempOTPExpires < Date.now(),
    });

    if (
      !user ||
      !user.tempOTP ||
      user.tempOTP !== otp ||
      user.tempOTPExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.tempOTP = null;
    user.tempOTPExpires = null;
    user.isEmailVerified = true;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30m" },
    );
    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify signup OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

module.exports = {
  loginOTP,
  signupOTP,
  verifyLoginOTP,
  verifySignupOTP,
  logout,
};
