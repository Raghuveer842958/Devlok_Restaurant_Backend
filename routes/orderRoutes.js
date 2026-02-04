// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

router.post("/", authMiddleware, orderController.create);
router.get("/", authMiddleware, orderController.get);
router.put("/:id/status", authMiddleware, orderController.updateStatus);
router.delete("/:id", authMiddleware, orderController.deleteOrder);

module.exports = router;
