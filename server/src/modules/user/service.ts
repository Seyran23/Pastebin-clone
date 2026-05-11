import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { LikeStats, Paste, User } from '@/db/models';
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

export const changePasswordService = async (
  username: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw new AppError(404, 'User not found');

  const isValid = bcrypt.compareSync(currentPassword, user.password);
  if (!isValid) throw new AppError(401, 'Current password is incorrect');

  const hashed = await hashingPassword(newPassword);
  await user.update({ password: hashed });
  await user.save();

  return { message: 'Your password has been updated!' };
};

export const deleteUserService = async (username: string) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw new AppError(404, 'User not found');

  if (user.avatar) await deleteFileFromS3(user.avatar);
  await user.destroy();

  return { message: 'User deleted successfully' };
};
