const { validateAccessToken } = require("../../services/token.service");

const authMiddleware = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accessToken = authorizationHeader.split(" ")[1];

    if (!accessToken) return res.status(401).json({ message: "Unauthorized" });

    const userData = validateAccessToken(accessToken);

    if (!userData)
      return res.status(401).json({ message: "Unauthorized: Invalid Token" });

    req.user = userData;
    next();
  } catch (err) {
    console.log(err.message);

    return res.status(500).json({ message: err.message });
  }
};

module.exports = authMiddleware;
