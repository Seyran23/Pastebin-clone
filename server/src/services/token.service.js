const jwt = require("jsonwebtoken");
const {
  JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN,
  JWT_ACCESS_TOKEN_EXPIRATION_TIME,
  JWT_REFRESH_TOKEN_EXPIRATION_TIME,
} = require("../utils/enviromentVariables");
const {Token} = require("../db/models")

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, JWT_ACCESS_TOKEN, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRATION_TIME,
  });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_TOKEN, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  });

  return {
    accessToken,
    refreshToken,
  };
};

const saveToken = async (userId, refreshToken) => {
  const tokenData = await Token.findOne({ where: { user_id: userId } });

  if (tokenData) {
    tokenData.refreshToken = refreshToken;
    return await tokenData.save();
  }

  const token = await Token.create({
    user_id: userId,
    refreshToken,
  });

  return token;
};

const removeToken = async (refreshToken) => {
  const tokenData = await Token.destroy({
    where: { refreshToken },
  });

  return tokenData;
};

const validateAccessToken = (accessToken) => {
  try {
    const decoded = jwt.verify(accessToken, JWT_ACCESS_TOKEN);
    return decoded;
  } catch (error) {
    return null;
  }
};

const validateRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_TOKEN);

    return decoded;
  } catch (error) {
    return null;
  }
};

const findToken = async (refreshToken) => {
  const tokenData = await Token.findOne({ where: { refreshToken } });

  return tokenData;
};

module.exports = {
  generateTokens,
  saveToken,
  removeToken,
  validateAccessToken,
  validateRefreshToken,
  findToken,
};
