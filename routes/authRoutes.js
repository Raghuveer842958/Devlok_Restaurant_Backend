const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login-otp", authController.loginOTP);        // Email + Password → OTP
router.post("/signup-otp", authController.signupOTP);      // Name + Email + Password → OTP
router.post("/verify-login-otp", authController.verifyLoginOTP);   // OTP → Login JWT
router.post("/verify-signup-otp", authController.verifySignupOTP); // OTP → Signup + JWT
router.post("/logout", authController.logout);             // Logout

module.exports = router;

