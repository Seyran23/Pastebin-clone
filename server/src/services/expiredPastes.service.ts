import { Op } from 'sequelize';

import { Paste } from '@/db/models';
import { deleteFileFromS3 } from '@/modules/cloud/service';

const markExpiredPastes = async (): Promise<void> => {
  const now = Date.now();
  await Paste.update(
    { expired: true },
    { where: { expiration_time: { [Op.lte]: now }, expired: false } },
  );
};

const deleteExpiredPastes = async (): Promise<void> => {
  const now = Date.now();

  const expiredPastes = await Paste.findAll({
    where: { expiration_time: { [Op.lte]: now }, expired: true },
  });

  for (const paste of expiredPastes) {
    try {
      await deleteFileFromS3(paste.cloud_name);
    } catch (err) {
      console.error(`Failed to delete S3 file for paste ${paste.id}:`, err);
    }
  }

  await Paste.destroy({
    where: { expiration_time: { [Op.lte]: now }, expired: true },
  });
};

export const startExpiredPasteJobs = (): void => {
  setInterval(() => {
    void markExpiredPastes();
  }, 60 * 1000);
  setInterval(
    () => {
      void deleteExpiredPastes();
    },
    2 * 60 * 1000,
  );
};

export { deleteExpiredPastes, markExpiredPastes };
