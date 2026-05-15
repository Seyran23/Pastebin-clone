import { LikeStats, Paste, User } from '@/db/models';
import { AppError } from '@/middlewares/error-handler';

export const toggleLikeService = async (username: string, pasteId: string, isLike: boolean) => {
  const [paste, user] = await Promise.all([
    Paste.findByPk(pasteId),
    User.findOne({ where: { username } }),
  ]);

  if (!paste) throw new AppError(404, 'Paste not found');
  if (!user) throw new AppError(404, 'User not found');

  const existing = await LikeStats.findOne({ where: { user_id: user.id, paste_id: pasteId } });

  if (existing) {
    await existing.update({ is_liked: isLike });
  } else {
    await LikeStats.create({ user_id: user.id, paste_id: pasteId, is_liked: isLike });
  }

  return {
    message: `You have ${isLike ? 'liked' : 'disliked'} the paste`,
    likedStatus: isLike,
  };
};

export const getLikeStatsService = async (pasteId: string, userId?: string) => {
  const [likes, dislikes, userRecord] = await Promise.all([
    LikeStats.count({ where: { paste_id: pasteId, is_liked: true } }),
    LikeStats.count({ where: { paste_id: pasteId, is_liked: false } }),
    userId
      ? LikeStats.findOne({ where: { paste_id: pasteId, user_id: userId } })
      : Promise.resolve(null),
  ]);
  return { likes, dislikes, userVote: userRecord ? userRecord.is_liked : null };
};
