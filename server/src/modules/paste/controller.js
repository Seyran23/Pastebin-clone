const {User, ExpirationTime} = require("../../db/models");
const {
  getCategoriesService,
  getByLinkPasteService,
  getHighlightsService,
  getExpirationTimeService,
  toggleLikeService,
  getLikeStatsService,
  createCommentService,
  createPasteService,
  deletePasteService,
  deleteCommentService,
  unlockPasteService,
} = require("./service");
const hashingPassword = require("../../utils/passwordHashing");
const randomFileName = require("../../utils/randomFileName");
const { uploadFileToS3 } = require("../../services/cloud.service");
const {
  getLinksFromCache,
  removeLinkFromCache,
} = require("./paste-link.service");



const getCategories = async (req, res) => {
  try {
    const categories = await getCategoriesService();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSyntaxHighlights = async (req, res) => {
  try {
    const syntaxHighlights = await getHighlightsService();

    res.status(200).json(syntaxHighlights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getExpirationTime = async (req, res) => {
  try {
    const expirationTimes = await getExpirationTimeService();
    res.status(200).json(expirationTimes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPasteByLink = async (req, res) => {
  try {
    const { link } = req.params;
    const requestingUser = req.user.username;

    const paste = await getByLinkPasteService( link);

    const pasteOwnerUsername = paste.user.username;

    // If the requesting user is the paste owner, return the paste directly
    if (pasteOwnerUsername === requestingUser) {
      const { requiresPassword, ...otherPartOfPaste } = paste;
      return res
        .status(200)
        .json({ ...otherPartOfPaste, requiresPassword: false });
    }

    // If the paste is private and user is not the owner
    if (paste.pasteData.exposure === "private") {
      return res.status(403).json({
        message:
          "Error, this is a private paste or is pending moderation. If this paste belongs to you, please login to Pastebin to view it.",
      });
    }

    // If paste has a password and the user is not the owner, indicate that a password is required
    if (paste.requiresPassword) {
      return res.status(200).json({ requiresPassword: true });
    }

    // If no password is required, return the paste content
    return res.status(200).json(paste);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const unlockPaste = async (req, res) => {
  try {
    const { link, password } = req.body;

    const paste = await unlockPasteService(link, password);

    res.status(200).json(paste);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPaste = async (req, res) => {
  try {
    const {
      content,
      category,
      exposure,
      expirationTime: selectedExpirationTime,
      name,
    } = req.body;

    let { password } = req.body;
    const { username } = req.user;

    const randomName = randomFileName("text");

    await uploadFileToS3(randomName, content, "text/plain");

    const user = await User.findOne({
      attributes: ["id"],
      where: {
        username,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found!" });

    const userId = user.id;

    if (password) {
      password = await hashingPassword(password);
    } else {
      password = null
    }

    const endpointLink = await getLinksFromCache();

    let expirationDate = null;
    if (selectedExpirationTime !== "never") {
      const expirationDuration = await ExpirationTime.findOne({
        where: { label: selectedExpirationTime },
      });

      if (!expirationDuration) {
        return res
          .status(404)
          .json({ message: "There is no this expiration time!" });
      }

      expirationDate = Date.now() + Number(expirationDuration.duration);
    }

    const pasteData = {
      createdBy: userId,
      category,
      exposure,
      password,
      name,
      link_endpoint: endpointLink,
      cloud_name: randomName,
      expiration_time: expirationDate,
    };

    const newPaste = await createPasteService(pasteData);

    await removeLinkFromCache();

    res.json(newPaste);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePaste = async (req, res) => {
  try {
    const pasteId = req.params.id;

    const response = await deletePasteService(pasteId);

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const togglePasteLike = async (req, res) => {
  try {
    const pasteId = req.params.id;
    const { isLike } = req.body;
    const { username } = req.user;

    const response = await toggleLikeService(username, pasteId, isLike);

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getLikeStats = async (req, res) => {
  try {
    const pasteId = req.params.id;

    const stats = await getLikeStatsService(pasteId);

    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const pasteId = req.params.id;
    const { username } = req.user;

    if (!content || content.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Comment content cannot be empty" });
    }

    const comment = await createCommentService(content, pasteId, username);

    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    const response = await deleteCommentService(commentId);

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCategories,
  getSyntaxHighlights,
  getExpirationTime,
  getPasteByLink,
  createPaste,
  deletePaste,
  unlockPaste,
  togglePasteLike,
  getLikeStats,
  createComment,
  deleteComment,
};
