const { API_URL } = require("../../utils/enviromentVariables");
const { User } = require("../../db/models");
const UserDto = require("./dto");

const uuid = require("uuid");
const { sendActivationMail } = require("../../services/mail.service");
const randomFileName = require("../../utils/randomFileName");
const {
  deleteFileFromS3,
  uploadFileToS3,
} = require("../../services/cloud.service");

const getProfileService = async (username) => {
  const user = await User.findOne({ where: { username } });

  if (!user) {
    throw new Error("User with this username is not found!");
  }

  return user;
};

const userProfileUpdateService = async (
  username,
  { email, location },
  file
) => {
  const user = await User.findOne({ where: { username } });

  if (!user) {
    throw new Error("User not found");
  }

  const emailChanged = user.email !== email;
  const locationChanged = user.location !== location;

  let avatarLink = user.avatar;

  if (file) {
    // if user already had avatar
    if (avatarLink) {
      await deleteFileFromS3(user.avatar);
    }

    const fileName = randomFileName("avatar");
    const fileContent = file.buffer;

    await uploadFileToS3(fileName, fileContent, file.mimetype);

    avatarLink = fileName;
  }

  const updateData = {
    avatar: avatarLink,
  };

  // if location was changed
  if (locationChanged) {
    updateData.location = location;
  }

  // if email was changed
  if (emailChanged) {
    updateData.email = email;
    updateData.isActivated = false;

    const newActivationLink = uuid.v4();
    updateData.activationLink = newActivationLink;

    await sendActivationMail(
      email,
      `${API_URL}/api/users/verify-email/${newActivationLink}`,
      user.username,
      "emailChange"
    );
  }

  await user.update(updateData);

  await user.reload();

  const userDto = new UserDto(user);

  return userDto;
};

module.exports = {
  getProfileService,
  userProfileUpdateService,
};
