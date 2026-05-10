import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../../db/models';
import { AppError } from '../../middlewares/error-handler';
import {
  findToken,
  generateTokens,
  removeToken,
  resetPasswordToken,
  saveToken,
  validateRefreshToken,
} from '../../services/token.service';
import attachAvatarImage from '../../utils/attachAvatar';
import { API_URL, CLIENT_URL } from '../../utils/env';
import hashingPassword from '../../utils/passwordHashing';
import {
  resendActivationEmail,
  sendForgotPasswordEmail,
  sendForgotUsernameEmail,
  sendRegistrationEmail,
} from '../mail/controller';
import { UserDto } from '../user/dto';

export const signupService = async (username: string, email: string, password: string) => {
  const [existingUsername, existingEmail] = await Promise.all([
    User.findOne({ where: { username } }),
    User.findOne({ where: { email } }),
  ]);

  if (existingUsername) throw new AppError(409, 'User with this username already exists');
  if (existingEmail) throw new AppError(409, 'User with this email already exists');

  const hashedPassword = await hashingPassword(password);
  const activationLink = uuidv4();

  const user = await User.create({ username, email, password: hashedPassword, activationLink });

  await sendRegistrationEmail(
    email,
    username,
    `${CLIENT_URL}/verify-email?activationLink=${activationLink}`,
  );

  const payload = { id: user.id, username, email, role: user.role, isActivated: user.isActivated };
  const tokens = generateTokens(payload);

  // Save refresh token so the user can refresh immediately after signup
  await saveToken(user.id, tokens.refreshToken);

  const userDto = new UserDto(user);
  return { ...tokens, user: userDto };
};

export const loginService = async (username: string, password: string) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw new AppError(404, "User with this username doesn't exist");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError(401, 'Incorrect password');

  const payload = { id: user.id, username, role: user.role, isActivated: user.isActivated };
  const tokens = generateTokens(payload);
  await saveToken(user.id, tokens.refreshToken);

  const userDto = new UserDto(user);
  await attachAvatarImage(user, userDto as unknown as Record<string, unknown>);

  return { ...tokens, user: userDto };
};

export const logoutService = async (refreshToken: string) => {
  return removeToken(refreshToken);
};

export const activateProfileService = async (activationLink: string, requestingUserId: string) => {
  const user = await User.findOne({ where: { activationLink } });
  if (!user) throw new AppError(404, 'Inaccurate link for activation');
  if (requestingUserId !== user.id) {
    throw new AppError(403, "You don't have permission to activate this account");
  }
  if (user.isActivated) throw new AppError(409, 'Account already activated');

  user.isActivated = true;
  user.activationLink = null;
  await user.save();

  const payload = { id: user.id, username: user.username, role: user.role, isActivated: true };
  const tokens = generateTokens(payload);
  const userDto = new UserDto(user);
  return { ...tokens, user: userDto };
};

export const refreshService = async (refreshToken: string) => {
  if (!refreshToken) throw new AppError(401, 'Unauthorized');

  const userData = validateRefreshToken(refreshToken);
  const tokenFromDb = await findToken(refreshToken);

  if (!userData || !tokenFromDb) throw new AppError(401, 'Unauthorized');

  const user = await User.findByPk(userData.id);
  if (!user) throw new AppError(401, 'Unauthorized');

  const userDto = new UserDto(user);
  const tokens = generateTokens({ ...userDto });
  await saveToken(userDto.id, tokens.refreshToken);

  return { ...tokens, user: userDto };
};

export const forgotPasswordService = async (username: string) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw new AppError(404, "User with this username doesn't exist");

  // Bug fix: was using undefined `email` variable — now correctly uses user.email
  const token = resetPasswordToken({ id: user.id, email: user.email });

  // Bug fix: was `http//localhost:3000` — now uses CLIENT_URL from env
  const link = `${CLIENT_URL}/resetpassword?token=${token}`;

  await sendForgotPasswordEmail(user.email, username, link);

  return {
    message:
      'We have sent you an email! It can sometimes take a few minutes before the email arrives.',
  };
};

export const forgotUsernameService = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new AppError(404, "User with this email doesn't exist");

  // Bug fix: was passing undefined `link` variable — forgotUsername email doesn't need a link
  await sendForgotUsernameEmail(email, user.username);

  return {
    message:
      'We have sent you an email! It can sometimes take a few minutes before the email arrives.',
  };
};

export const resendActivationEmailService = async (username: string, email: string) => {
  const user = await User.findOne({ where: { username, email } });
  if (!user) throw new AppError(404, 'User not found');
  if (user.isActivated) throw new AppError(409, 'This account is already activated.');

  const activationLink = uuidv4();
  user.activationLink = activationLink;
  await user.save();

  await resendActivationEmail(
    email,
    username,
    `${API_URL}/api/auth/verify-email/${activationLink}`,
  );

  return {
    message:
      'We have sent you an email! It can sometimes take a few minutes before the email arrives.',
  };
};
