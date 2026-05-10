import transporter from './transporter';
import EMAIL_TEMPLATES from './templates';
import { SMTP_USER } from '../../utils/env';
import { AppError } from '../../middlewares/error-handler';
import type { MailAction } from './constants';

interface MailData {
  username?: string;
  link?: string;
}

export const sendMailService = async (to: string, action: MailAction, data: MailData = {}): Promise<void> => {
  const template = EMAIL_TEMPLATES[action];

  if (!template) {
    throw new AppError(400, `No email template found for action: ${action}`);
  }

  const { subject, html } = template(data);

  await transporter.sendMail({ from: SMTP_USER, to, subject, html });
};
