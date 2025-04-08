const {
  getProfileService,
  userProfileUpdateService,
} = require("./service");
const { getFileFromS3 } = require("../../services/cloud.service");
const UserDto = require("./dto");

const getProfile = async (req, res) => {
  try {
    const username = req.params.username;

    const user = await getProfileService(username);

    const fileContent = await getFileFromS3(user.avatar);

    let formattedContent;

    if (fileContent.contentType.startsWith("text/")) {
      formattedContent = fileContent.buffer.toString("utf-8");
    } else if (fileContent.contentType.startsWith("image/")) {
      formattedContent = `data:${
        fileContent.contentType
      };base64,${fileContent.buffer.toString("base64")}`;
    } else {
      res
        .status(404)
        .json({ message: "Unsupported file type.Supported: jpeg, jpg, png" });
    }

    const userDto = new UserDto(user);

    return res.status(200).json({ ...userDto, avatar: formattedContent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserProfileDetails = async (req, res) => {
  try {
    const { username } = req.user;
    const { email, location } = req.body;
    const updateUser = await userProfileUpdateService(username, {
      email,
      location,
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        ...updateUser,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const avatar = req.file;
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProfile,
  updateUserProfileDetails,
  updateAvatar,
};
