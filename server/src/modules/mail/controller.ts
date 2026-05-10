import { MailActions } from './constants';
import { sendMailService } from './service';

export const sendRegistrationEmail = (to: string, username: string, link: string) =>
  sendMailService(to, MailActions.REGISTRATION, { username, link });

export const sendEmailAddressChangeEmail = (to: string, username: string, link: string) =>
  sendMailService(to, MailActions.EMAIL_CHANGE, { username, link });

export const sendForgotUsernameEmail = (to: string, username: string) =>
  sendMailService(to, MailActions.FORGOT_USERNAME, { username });

export const sendForgotPasswordEmail = (to: string, username: string, link: string) =>
  sendMailService(to, MailActions.FORGOT_PASSWORD, { username, link });

export const resendActivationEmail = (to: string, username: string, link: string) =>
  sendMailService(to, MailActions.RESEND_ACTIVATION, { username, link });
