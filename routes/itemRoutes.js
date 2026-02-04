const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const role = require("../middleware/roleMiddleware");

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  itemController.add,
); // Add an item

router.get("/", authMiddleware, itemController.get); // Fetch all items
router.get("/category/:categoryId", authMiddleware, itemController.getById); // Fetch all items of the selected category
router.put("/:id", authMiddleware, itemController.update); // Update an item
router.delete("/:id", authMiddleware, itemController.remove);


module.exports = router;
