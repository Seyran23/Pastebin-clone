import { User } from '@/db/models';
import { generateTokens, saveToken } from '@/services/token.service';

import { UserDto } from '../user/dto';

interface GoogleProfile {
  googleId: string;
  email: string;
  displayName: string;
}

const buildUsername = async (displayName: string): Promise<string> => {
  const base = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 16);

  const candidate = base || 'user';
  const existing = await User.findOne({ where: { username: candidate } });
  if (!existing) return candidate;

  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${candidate}${suffix}`.slice(0, 20);
};

export const findOrCreateGoogleUser = async ({ googleId, email, displayName }: GoogleProfile) => {
  let user = await User.findOne({ where: { googleId } });

  if (!user) {
    user = await User.findOne({ where: { email } });

    if (user) {
      await user.update({ googleId });
    } else {
      const username = await buildUsername(displayName);
      user = await User.create({
        username,
        email,
        googleId,
        password: null,
        isActivated: true,
      });
    }
  }

  const userDto = new UserDto(user);
  const tokens = generateTokens({ ...userDto });
  await saveToken(user.id, tokens.refreshToken);

  return { ...tokens, user: userDto };
};
