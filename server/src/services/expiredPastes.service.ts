import { Op } from 'sequelize';

import { Paste } from '@/db/models';
import { deleteFileFromS3 } from '@/modules/cloud/service';
import logger from '@/utils/logger';

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
      logger.error({ pasteId: paste.id, err }, 'Failed to delete S3 file for paste');
    }
  }

  await Paste.destroy({
    where: { expiration_time: { [Op.lte]: now }, expired: true },
  });
};

const scheduleMarkExpired = (): void => {
  const run = async () => {
    try {
      await markExpiredPastes();
    } catch (err) {
      logger.error({ err }, 'markExpiredPastes failed');
    } finally {
      setTimeout(run, 60 * 1000);
    }
  };
  setTimeout(run, 60 * 1000);
};

const scheduleDeleteExpired = (): void => {
  const run = async () => {
    try {
      await deleteExpiredPastes();
    } catch (err) {
      logger.error({ err }, 'deleteExpiredPastes failed');
    } finally {
      setTimeout(run, 2 * 60 * 1000);
    }
  };
  setTimeout(run, 2 * 60 * 1000);
};

export const startExpiredPasteJobs = (): void => {
  scheduleMarkExpired();
  scheduleDeleteExpired();
};

export { deleteExpiredPastes, markExpiredPastes };
