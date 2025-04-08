const redisClient = require("../../utils/redis");
const generateBase64HashService = require("../../services/hashing.service");
const { v4: uuidv4 } = require("uuid");

const LINK_CACHE_KEY = "hashed-links";
const BATCH_SIZE = 30;

const cahceLinksIfNeeded = async () => {
  const linkCount = await redisClient.lLen(LINK_CACHE_KEY);

  if (linkCount < 1) {
    const newLinks = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const uniqueStr = generateBase64HashService(
        `${Date.now()}-${uuidv4()}`
      );
      newLinks.push(uniqueStr);
    }

    await redisClient.rPush(LINK_CACHE_KEY, newLinks);
  }
};

const getLinksFromCache = async () => {
  await cahceLinksIfNeeded();
  const link = await redisClient.lIndex(LINK_CACHE_KEY, 0);
  return link;
};

const removeLinkFromCache = async () => {
  await redisClient.lPop(LINK_CACHE_KEY);
};

module.exports = { getLinksFromCache, removeLinkFromCache };


