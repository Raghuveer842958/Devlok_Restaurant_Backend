const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("admin"), staffController.get); // Fetch all staff members (admin only)
router.put("/:id", authMiddleware, roleMiddleware("admin"), staffController.update); // Update a staff member (admin only)
router.delete("/:id", authMiddleware, roleMiddleware("admin"), staffController.remove); // Delete a staff member (admin only)

module.exports = router;
