import bcrypt from 'bcrypt';
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { LikeStats, Paste, sequelize, SyntaxHighlights, User } from '@/db/models';
import { AppError } from '@/middlewares/error-handler';
import { deleteFileFromS3 } from '@/modules/cloud/service';
import { sendEmailAddressChangeEmail } from '@/modules/mail/controller';
import attachAvatarImage from '@/utils/attachAvatar';
import { CLIENT_URL } from '@/utils/env';
import hashingPassword from '@/utils/passwordHashing';

import { UserDto } from './dto';

export const getProfileService = async (username: string) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw new AppError(404, 'User not found!');
  return user;
};

export const userProfileUpdateService = async (
  username: string,
  { email, location }: { email?: string; location?: string },
) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw new AppError(404, 'User not found');

  const updateData: Partial<{
    email: string;
    isActivated: boolean;
    activationLink: string;
    location: string;
  }> = {};

  if (location && location !== user.location) {
    updateData.location = location;
  }

  if (email && email !== user.email) {
    updateData.email = email;
    updateData.isActivated = false;
    const newActivationLink = uuidv4();
    updateData.activationLink = newActivationLink;
    await sendEmailAddressChangeEmail(
      email,
      user.username,
      `${CLIENT_URL}/verify-email?activationLink=${newActivationLink}`,
    );
  }

  await user.update(updateData);
  await user.save();

  const userDto = new UserDto(user);
  await attachAvatarImage(user, userDto as unknown as Record<string, unknown>);
  return userDto;
};

export const avatarUpdateService = async (
  username: string,
  file: (Express.Multer.File & { key: string }) | undefined,
) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw new AppError(404, 'User not found');
  if (!file) throw new AppError(422, 'No file provided');

  if (user.avatar) await deleteFileFromS3(user.avatar);

  await user.update({ avatar: file.key });
  await user.save();

  const target: Record<string, unknown> = {};
  await attachAvatarImage(user, target);
  return { message: 'Avatar updated successfully', newAvatar: target.avatar };
};

export const getPasteStatsForUserService = async (username: string, requestingUserId?: string) => {
  const user = await User.findOne({
    where: { username },
    attributes: ['id', 'username', 'createdAt'],
  });
  if (!user) throw new AppError(404, 'User not found');

  if (requestingUserId !== user.id) {
    throw new AppError(403, "You are not authorized to view this user's stats");
  }

  const [totalPastes, publicPastes, unlistedPastes, privatePastes, totalLikes] = await Promise.all([
    Paste.count({ where: { createdBy: user.id, expired: false } }),
    Paste.count({ where: { createdBy: user.id, exposure: 'public', expired: false } }),
    Paste.count({ where: { createdBy: user.id, exposure: 'unlisted', expired: false } }),
    Paste.count({ where: { createdBy: user.id, exposure: 'private', expired: false } }),
    LikeStats.count({
      where: { is_liked: true },
      include: [
        {
          model: Paste,
          required: true,
          as: 'paste',
          where: { createdBy: user.id, expired: false },
        },
      ],
    }),
  ]);

  return {
    totalActivePastes: totalPastes,
    publicPastes,
    unlistedPastes,
    privatePastes,
    totalLikes,
  };
};

export const getDashboardService = async (username: string, requestingUserId?: string) => {
  const user = await User.findOne({
    where: { username },
    attributes: ['id'],
  });
  if (!user) throw new AppError(404, 'User not found');
  if (requestingUserId !== user.id) throw new AppError(403, 'Forbidden');

  const uid = user.id;
  const r = { replacements: { uid }, type: QueryTypes.SELECT } as const;

  const [totalPastes, totalViews, totalLikes, totalComments, pastesByMonth, likesByMonth, commentsByMonth] =
    await Promise.all([
      Paste.count({ where: { createdBy: uid, expired: false } }),
      Paste.sum('view_count', { where: { createdBy: uid } }).then((v) => v ?? 0),
      sequelize.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM like_stats ls
         INNER JOIN pastes p ON ls.paste_id = p.id
         WHERE p."createdBy" = :uid AND ls.is_liked = true`,
        r,
      ).then((rows) => Number(rows[0]?.count ?? 0)),
      sequelize.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM comments c
         INNER JOIN pastes p ON c.paste_id = p.id
         WHERE p."createdBy" = :uid`,
        r,
      ).then((rows) => Number(rows[0]?.count ?? 0)),
      sequelize.query<{ month: string; count: string }>(
        `SELECT TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month, COUNT(*) AS count
         FROM pastes WHERE "createdBy" = :uid
         GROUP BY DATE_TRUNC('month', "createdAt")
         ORDER BY DATE_TRUNC('month', "createdAt") ASC`,
        r,
      ),
      sequelize.query<{ month: string; count: string }>(
        `SELECT TO_CHAR(DATE_TRUNC('month', ls."createdAt"), 'YYYY-MM') AS month, COUNT(*) AS count
         FROM like_stats ls
         INNER JOIN pastes p ON ls.paste_id = p.id
         WHERE p."createdBy" = :uid AND ls.is_liked = true
         GROUP BY DATE_TRUNC('month', ls."createdAt")
         ORDER BY DATE_TRUNC('month', ls."createdAt") ASC`,
        r,
      ),
      sequelize.query<{ month: string; count: string }>(
        `SELECT TO_CHAR(DATE_TRUNC('month', c."createdAt"), 'YYYY-MM') AS month, COUNT(*) AS count
         FROM comments c
         INNER JOIN pastes p ON c.paste_id = p.id
         WHERE p."createdBy" = :uid
         GROUP BY DATE_TRUNC('month', c."createdAt")
         ORDER BY DATE_TRUNC('month', c."createdAt") ASC`,
        r,
      ),
    ]);

  const topPastes = await Paste.findAll({
    where: { createdBy: user.id, expired: false },
    attributes: ['id', 'name', 'link_endpoint', 'view_count', 'exposure', 'createdAt'],
    include: [{ model: SyntaxHighlights, as: 'syntaxHighlight', attributes: ['language'] }],
    order: [['view_count', 'DESC']],
    limit: 5,
  });

  return {
    summary: { totalPastes, totalViews: Number(totalViews), totalLikes, totalComments },
    pastesByMonth,
    likesByMonth,
    commentsByMonth,
    topPastes,
  };
};

export const changePasswordService = async (
  username: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw new AppError(404, 'User not found');

  if (!user.password) throw new AppError(400, 'This account uses Google sign-in');
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new AppError(401, 'Current password is incorrect');

  const hashed = await hashingPassword(newPassword);
  await user.update({ password: hashed });
  await user.save();

  return { message: 'Your password has been updated!' };
};

export const deleteUserService = async (username: string) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw new AppError(404, 'User not found');

  const pastes = await Paste.findAll({
    where: { createdBy: user.id },
    attributes: ['cloud_name'],
  });

  await Promise.all([
    ...pastes.map((p) => deleteFileFromS3(p.cloud_name)),
    user.avatar ? deleteFileFromS3(user.avatar) : Promise.resolve(),
  ]);

  await user.destroy();

  return { message: 'User deleted successfully' };
};
