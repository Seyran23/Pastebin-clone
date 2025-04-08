const { Op } = require("sequelize");
const {Paste} = require("../db/models");
const { deleteFileFromS3 } = require("./cloud.service");

const markExpiredPastes = async () => {
  const now = Date.now();

  await Paste.update(
    { expired: true },
    {
      where: {
        expiration_time: { [Op.lte]: now },
        expired: false,
      },
    }
  );
};

setInterval(markExpiredPastes, 60 * 1000);

const deleteExpiredPastes = async () => {
  const now = Date.now();

  const expiredPastes = await Paste.findAll({
    where: {
      expiration_time: { [Op.lte]: now },
      expired: true,
    },
  });

  for (const paste of expiredPastes) {
    try {
      await deleteFileFromS3(paste.cloud_name);
    } catch (error) {
      console.error(
        `Error deleting file from S3 for paste ${paste.id}: `,
        error
      );
    }
  }

  await Paste.destroy({
    where: {
      expiration_time: { [Op.lte]: now },
      expired: true,
    },
  });
};

setInterval(deleteExpiredPastes, 2 * 60 * 1000);

module.exports = { markExpiredPastes, deleteExpiredPastes };
