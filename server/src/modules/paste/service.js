const redisClient = require("../../utils/redis");
const bcrypt = require("bcrypt");

const { deleteFileFromS3, getFileFromS3 } = require("../../services/cloud.service");
const PasteDto = require("./dto");

const {
  User,
  Paste,
  SyntaxHighlights,
  PasteCategory,
  ExpirationTime,
  LikeStats,
  Comment,
} = require("../../db/models");

const getCategoriesService = async () => {
  const cacheKey = "paste:categories";

  const cachedCategories = await redisClient.get(cacheKey);

  if (!cachedCategories) {
    const categories = await PasteCategory.findAll({
      attributes: ["category_name"],
      raw: true,
    });

    const categoriesList = categories.map((category) => category.category_name);

    await redisClient.set(cacheKey, JSON.stringify(categoriesList));

    return categoriesList;
  }

  return JSON.parse(cachedCategories);
};

const getHighlightsService = async () => {
  const cahcheKey = "paste:syntax-highlights";

  const cachedHighlights = await redisClient.get(cahcheKey);

  if (!cachedHighlights) {
    const syntaxHighlights = await SyntaxHighlights.findAll({
      attributes: ["language"],
      raw: true,
    });

    const highlightsList = syntaxHighlights.map(
      (highlight) => highlight.language
    );

    await redisClient.set(cahcheKey, JSON.stringify(highlightsList));

    return highlightsList;
  }

  return JSON.parse(cachedHighlights);
};

const getExpirationTimeService = async () => {
  const cahcheKey = "paste:expiration-time";

  const cachedTimes = await redisClient.get(cahcheKey);

  if (!cachedTimes) {
    const expirationTimes = await ExpirationTime.findAll({
      attributes: ["label"],
      raw: true,
    });

    const expirationTimesList = expirationTimes.map((exp) => exp.label);

    await redisClient.set(cahcheKey, JSON.stringify(expirationTimesList));

    return expirationTimesList;
  }

  return JSON.parse(cachedTimes);
};

const getByLinkPasteService = async (link) => {
  const paste = await Paste.findOne({
    where: { link_endpoint: link },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "username"],
      },
    ],
  });

  if (!paste) {
    throw new Error("Paste is not found");
  }

  const requiresPassword = !!paste.password;

  const now = Date.now();
  const isExpired =
    paste.expiration_time !== null && paste.expiration_time <= now;

  if (isExpired) {
    throw new Error("Paste has expired");
  }

  const remainingTime =
    paste.expiration_time !== null ? paste.expiration_time - now : null;

  const fileContent = await getFileFromS3(paste.cloud_name);

  const pasteDto = new PasteDto(paste);

  let formattedContent;

  if (fileContent.contentType.startsWith("text/")) {
    formattedContent = fileContent.buffer.toString("utf-8");
  } else if (fileContent.contentType.startsWith("image/")) {
    formattedContent = `data:${
      fileContent.contentType
    };base64,${fileContent.buffer.toString("base64")}`;
  } else {
    throw new Error("Unsupported file type");
  }

  return {
    pasteData: {
      ...pasteDto,
      content: formattedContent,
      memoryAmount: fileContent.memoryAmount,
      contentType: fileContent.contentType,
    },
    user: {
      id: paste.user.id,
      username: paste.user.username,
    },
    remainingTime,
    requiresPassword,
  };
};

const unlockPasteService = async (link, inputPassword) => {
  const paste = await Paste.findOne({
    where: {
      link_endpoint: link,
    },
  });

  if (!paste) {
    throw new Error("Paste not found");
  }

  if (!paste.password) {
    throw new Error("Paste is not password-protected");
  }

  const isPasswordCorrect = await bcrypt.compare(inputPassword, paste.password);

  if (!isPasswordCorrect) {
    throw new Error("Invalid Password");
  }

  const pasteDto = new PasteDto(paste);

  return pasteDto;
};

const createPasteService = async (pasteData) => {
  const newPaste = await Paste.create(pasteData);
  const pasteDto = new PasteDto(newPaste);
  return pasteDto;
};

const deletePasteService = async (pasteId) => {
  const paste = await Paste.findByPk(pasteId);

  if (!paste) {
    throw new Error("Paste not found");
  }

  const fileName = paste.cloud_name;

  await deleteFileFromS3(fileName);

  await paste.destroy();

  return {
    message: "Paste was deleted successfully!",
  };
};

const toggleLikeService = async (username, pasteId, isLike) => {
  const [paste, user] = await Promise.all([
    Paste.findByPk(pasteId),
    User.findOne({ where: { username } }),
  ]);

  if (!paste) {
    throw new Error("Paste not found");
  }

  if (!user) {
    throw new Error("Paste not found");
  }

  const userId = user.id;

  const existingEntry = await LikeStats.findOne({
    where: {
      user_id: userId,
      paste_id: pasteId,
    },
  });

  let currentStatus;

  if (existingEntry) {
    currentStatus = existingEntry.is_liked;
    await existingEntry.update({ is_liked: isLike });
  } else {
    await LikeStats.create({
      user_id: userId,
      paste_id: pasteId,
      is_liked: isLike,
    });
    currentStatus = isLike;
  }

  return {
    message: `You have ${isLike ? "liked" : "disliked"} the paste`,
    likedStatus: isLike,
    previousStatus: currentStatus,
  };
};

const getLikeStatsService = async (pasteId) => {
  const paste = await Paste.findByPk(pasteId);

  if (!paste) {
    throw new Error("Paste not found");
  }

  const likesCount = await LikeStats.count({
    where: {
      paste_id: pasteId,
      is_liked: true,
    },
  });

  const dislikesCount = await LikeStats.count({
    where: {
      paste_id: pasteId,
      is_liked: false,
    },
  });

  return {
    likes: likesCount,
    dislikes: dislikesCount,
  };
};

const createCommentService = async (content, pasteId, username) => {
  const [paste, user] = await Promise.all([
    Paste.findByPk(pasteId),
    User.findOne({ where: { username } }),
  ]);

  if (!paste) {
    throw new Error("Paste not found");
  }

  if (!user) {
    throw new Error("Paste not found");
  }

  const userId = user.id;

  const newComment = await Comment.create({
    content,
    paste_id: pasteId,
    user_id: userId,
  });

  return newComment;
};

const deleteCommentService = async (commentId) => {
  const comment = await Comment.findByPk(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  await comment.destroy();

  return {
    message: "Comment was deleted successfully!",
  };
};

module.exports = {
  getCategoriesService,
  getHighlightsService,
  getExpirationTimeService,
  getByLinkPasteService,
  unlockPasteService,
  createPasteService,
  deletePasteService,
  toggleLikeService,
  getLikeStatsService,
  createCommentService,
  deleteCommentService,
};
