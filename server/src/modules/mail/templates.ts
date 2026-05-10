import type { MailAction } from './constants';

interface TemplateData {
  username?: string;
  link?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
}

type TemplateMap = Record<MailAction, (data: TemplateData) => EmailTemplate>;

const EMAIL_TEMPLATES: TemplateMap = {
  registration: ({ username, link }) => ({
    subject: 'Account registration at Pastebin',
    html: `<div><p>Hello ${username},</p><p>Follow the link below to verify your email:</p><a href="${link}">${link}</a></div>`,
  }),

  emailChange: ({ username, link }) => ({
    subject: 'Email Change Verification at Pastebin',
    html: `<div><p>Hello ${username},</p><p>Your email has been changed. Follow the link below to verify your new email address:</p><a href="${link}">${link}</a></div>`,
  }),

  forgotUsername: ({ username }) => ({
    subject: 'Username Information',
    html: `<div><p>Hello ${username},</p><p>It seems you have requested a reminder of your Pastebin username.</p><p>Your Pastebin username is: <strong>${username}</strong></p></div>`,
  }),

  forgotPassword: ({ username, link }) => ({
    subject: 'Password Reset for Pastebin',
    html: `<div><p>Hello ${username},</p><p>Click the link below to reset your password:</p><a href="${link}">${link}</a></div>`,
  }),

  resendActivation: ({ username, link }) => ({
    subject: 'Resend Activation Link',
    html: `<div><p>Hello ${username},</p><p>Click the link below to activate your account:</p><a href="${link}">${link}</a></div>`,
  }),
};

export default EMAIL_TEMPLATES;
