const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post(
  "/",
  authMiddleware,
  upload.single("image"),   // 🔥 THIS WAS MISSING
  categoryController.add
);

router.get(
  "/",
  authMiddleware,
  categoryController.get
);

router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),   // 🔥 ALSO REQUIRED HERE
  categoryController.update
);

router.delete(
  "/:id",
  authMiddleware,
  categoryController.remove  // ✅ NEW
);

module.exports = router;
