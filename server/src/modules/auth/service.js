const {API_URL} = require("../../utils/enviromentVariables");
const {User} = require("../../db/models");
const UserDto = require("../user/dto");

const hashingPassword = require("../../utils/passwordHashing");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const {
    generateTokens,
    saveToken,
    removeToken,
    validateRefreshToken,
    findToken,
  } = require("../../services/token.service");
const { sendActivationMail } = require("../../services/mail.service");

  

const signupService = async (username, email, password) => {
  const candidateUsername = await User.findOne({
    where: { username },
  });

  if (candidateUsername) {
    throw new Error("User with this username exits");
  }

  const candidateEmail = await User.findOne({
    where: { email },
  });

  if (candidateEmail) {
    throw new Error("User with this email exits");
  }

  const hashedPassword = await hashingPassword(password);
  const activationLink = uuid.v4();

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    activationLink,
  });



  await sendActivationMail(
    email,
    `${API_URL}/api/auth/verify-email/${activationLink}`,
    username,
    "registration"
  );


  const payload = { username, role: user.role };

  const tokens = generateTokens(payload);

  await saveToken(user.id, tokens.refreshToken);

  const userDto = new UserDto(user);

  return {
    ...tokens,
    user: userDto,
  };
};

const loginService = async (username, password) => {
  const user = await User.findOne({
    where: { username },
  });

  if (!user) {
    throw new Error("User with this username doesn't exist");
  }

  const isPasswordEqual = await bcrypt.compare(password, user.password);

  if (!isPasswordEqual) {
    throw new Error("Incorrect password");
  }

  const payload = { username, role: user.role };

  const tokens = generateTokens(payload);
  await saveToken(user.id, tokens.refreshToken);

  const userDto = new UserDto(user);

  return {
    ...tokens,
    user: userDto,
  };
};

const logoutService = async (refreshToken) => {
  const token = await removeToken(refreshToken);
  return token;
};

const activateProfileService = async (activationLink) => {
  const user = await User.findOne({ where: { activationLink } });

  if (!user) {
    throw new Error("Inaccurate link for activation");
  }

  user.isActivated = true;
  await user.save();
};

const refreshService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Unauthorized");
  }

  const userData = validateRefreshToken(refreshToken);
  const tokenFromDb = await findToken(refreshToken);

  if (!userData || !tokenFromDb) {
    throw new Error("Unauthorized");
  }

  const user = await User.findByPk(userData.id);
  const userDto = new UserDto(user);
  const tokens = generateTokens({ ...userDto });

  await saveToken(userDto.id, tokens.refreshToken);

  return {
    ...tokens,
    user: userDto,
  };
};


module.exports = {
  signupService,
  loginService,
  logoutService,
  refreshService,
  activateProfileService,
};