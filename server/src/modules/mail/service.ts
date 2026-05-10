import { SMTP_USER } from '../../utils/env';

import type { MailAction } from './constants';
import EMAIL_TEMPLATES from './templates';
import transporter from './transporter';

interface MailData {
  username?: string;
  link?: string;
}

export const sendMailService = async (
  to: string,
  action: MailAction,
  data: MailData = {},
): Promise<void> => {
  const { subject, html } = EMAIL_TEMPLATES[action](data);
  await transporter.sendMail({ from: SMTP_USER, to, subject, html });
};
