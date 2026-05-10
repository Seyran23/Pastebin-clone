export const MailActions = {
  REGISTRATION: 'registration',
  EMAIL_CHANGE: 'emailChange',
  FORGOT_USERNAME: 'forgotUsername',
  FORGOT_PASSWORD: 'forgotPassword',
  RESEND_ACTIVATION: 'resendActivation',
} as const;

export type MailAction = (typeof MailActions)[keyof typeof MailActions];
