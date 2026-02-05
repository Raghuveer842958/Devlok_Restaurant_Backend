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
