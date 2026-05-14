export const loginPageLinks = [
  { href: '/signup', label: 'Create New Account' },
  { href: '/usernamemailer', label: 'Forgot Username' },
  { href: '/passmailer', label: 'Forgot Password' },
  { href: '/resend', label: 'No Activation Mail' },
];

export const signupPageLinks = [
  { href: '/login', label: 'Already Have An Account' },
  { href: '/usernamemailer', label: 'Forgot Username' },
  { href: '/passmailer', label: 'Forgot Password' },
  { href: '/resend', label: 'No Activation Mail' },
];

export const passmailerPageLinks = [
  { href: '/usernamemailer', label: 'Forgot Username' },
  { href: '/resend', label: 'No Activation Mail' },
];

export const usermailerPageLinks = [
  { href: '/passmailer', label: 'Forgot Password' },
  { href: '/resend', label: 'No Activation Mail' },
];

export const resendPageLinks = [
  { href: '/usernamemailer', label: 'Forgot Username' },
  { href: '/passmailer', label: 'Forgot Password' },
];

export const userSettingsLinks = [
  { href: '/user/profile', label: 'Profile' },
  { href: '/user/change-avatar', label: 'Avatar' },
  { href: '/user/password', label: 'Password' },
  { href: '/user/delete-account', label: 'Delete Account' },
];
