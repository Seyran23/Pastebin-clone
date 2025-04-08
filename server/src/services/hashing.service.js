const crypto = require("crypto");

const generateBase64HashService = (input) => {
  const hash = crypto.createHash("sha256").update(input).digest("base64");

  const sanitizedHash = hash
    .replace(/\+/g, "")
    .replace(/\//g, "")
    .replace(/=/g, "");

  return sanitizedHash.substring(0, 8);
};

module.exports = generateBase64HashService;
