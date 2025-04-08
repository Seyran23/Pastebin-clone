const uuid = require("uuid");

const randomFileName = (string) => {
  const randomStr = uuid.v6().split("-").join("");
  return `${string}-${randomStr}`;
};

module.exports = randomFileName;
