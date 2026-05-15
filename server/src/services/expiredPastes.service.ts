import cron from 'node-cron';
import { Op } from 'sequelize';

import { Paste } from '@/db/models';
import { deleteFileFromS3 } from '@/modules/cloud/service';
import logger from '@/utils/logger';

export const deleteExpiredPastes = async (): Promise<void> => {
  const now = Date.now();

  const expiredPastes = await Paste.findAll({
    where: { expiration_time: { [Op.lte]: now }, expired: false },
    attributes: ['id', 'cloud_name'],
  });

  if (expiredPastes.length === 0) return;

  logger.info(`Cleaning up ${expiredPastes.length} expired paste(s)`);

  for (const paste of expiredPastes) {
    try {
      await deleteFileFromS3(paste.cloud_name);
    } catch (err) {
      logger.error({ pasteId: paste.id, err }, 'Failed to delete S3 file for expired paste');
    }
  }

  await Paste.destroy({
    where: { expiration_time: { [Op.lte]: now }, expired: false },
  });
};

// Runs at midnight and 6am daily as a safety sweep
export const startExpiredPasteJobs = (): void => {
  cron.schedule('0 0 * * *', () => {
    void deleteExpiredPastes().catch((err) =>
      logger.error({ err }, 'Midnight expired paste cleanup failed'),
    );
  });

  cron.schedule('0 6 * * *', () => {
    void deleteExpiredPastes().catch((err) =>
      logger.error({ err }, '6am expired paste cleanup failed'),
    );
  });

  logger.info('Expired paste cleanup scheduled (midnight + 6am daily)');
};
