import { v4 as uuidv4 } from 'uuid';

import generateBase64HashService from '../../services/hashing.service';
import redisClient from '../../utils/redis';

const LINK_CACHE_KEY = 'hashed-links';
const BATCH_SIZE = 30;

const cacheLinksIfNeeded = async (): Promise<void> => {
  const linkCount = await redisClient.lLen(LINK_CACHE_KEY);
  if (linkCount < 1) {
    const newLinks: string[] = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      newLinks.push(generateBase64HashService(`${Date.now()}-${uuidv4()}`));
    }
    await redisClient.rPush(LINK_CACHE_KEY, newLinks);
  }
};

export const getLinksFromCache = async (): Promise<string> => {
  await cacheLinksIfNeeded();
  const link = await redisClient.lIndex(LINK_CACHE_KEY, 0);
  return link ?? generateBase64HashService(`${Date.now()}-${uuidv4()}`);
};

export const removeLinkFromCache = async (): Promise<void> => {
  await redisClient.lPop(LINK_CACHE_KEY);
};
