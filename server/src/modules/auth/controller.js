const { CLIENT_URL } = require("../../utils/enviromentVariables");
const {
  signupService,
  loginService,
  logoutService,
  refreshService,
  activateProfileService,
} = require("./service");



const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const {accessToken, refreshToken, user} = await signupService(username, email, password);

    res.cookie("refreshToken", refreshToken, {
      maxAge: 30 * 24 * 3600 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({accessToken, user});
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};



const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const {accessToken, refreshToken, user} = await loginService(username, password);

    res.cookie("refreshToken", refreshToken, {
      maxAge: 30 * 24 * 3600 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({accessToken, user});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    const token = await logoutService(refreshToken);
    res.clearCookie("refreshToken");
    return res.status(200).json({message: "Logout successful", token});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const userData = refreshService(refreshToken);

    res.cookie("refreshToken", userData.refreshToken, {
      maxAge: 30 * 24 * 3600 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({accessToken: userData.accessToken, user: userData.user});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const activateProfile = async (req, res) => {
  try {
    const { activationLink } = req.params;
    await activateProfileService(activationLink);
    return res.redirect(`${CLIENT_URL}/user/profile`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  signup,
  login,
  logout,
  refresh,
  activateProfile,
};
