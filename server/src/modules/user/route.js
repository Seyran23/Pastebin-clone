const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateUserProfile,
  updateAvatar,
  updateUserProfileDetails,
} = require("./controller");

const { User, Paste } = require("../../db/models");

const authMiddleware = require("../auth/middleware");

const upload = require("../../middlewares/multer.middleware");

const { getFileFromS3 } = require("../../services/cloud.service");


router.put("/edit-profile-details", authMiddleware, updateUserProfileDetails);
router.put(
  "/edit-profile-avatar",
  authMiddleware,
  upload.single("avatar"),
  updateAvatar
);

router.post("/test", upload.single("avatar"), async (req, res) => {
  try {
    const file = req.file;
    res.json(file);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/test/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const paste = await Paste.findOne({ where: { cloud_name: filename } });
    const file = await getFileFromS3(filename);
    res.set("Content-Type", file.contentType);

    res.json({ paste, file: file.buffer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/profile/:username", getProfile);

module.exports = router;
