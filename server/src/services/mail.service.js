const nodemailer = require("nodemailer");
const {
  SMTP_HOST,
  SMTP_USER,
  SMTP_PORT,
  SMTP_PASSWORD,
} = require("../utils/enviromentVariables");

const sendActivationMail = async (to, link, username, action) => {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
    logger: true,
    debug: true,
  });



  let subject;
  let html;

  switch (action) {
    case "registration":
      subject = "Account registration at Pastebin";
      html = `
            <div>
                <p>Hello ${username},</p>
                <p>Follow the link below to verify your email:</p>
                <a href="${link}">${link}</a>
            </div>
        `;
      break;

    case "emailChange":
      subject = "Email Change Verification at Pastebin";
      html = `
        <div>
            <p>Hello ${username},</p>
            <p>Your email has been changed. Follow the link below to verify your new email address:</p>
            <a href="${link}">${link}</a>
        </div>
      `;
      break;
  }

  await transporter.sendMail({
    from: SMTP_USER,
    to,
    subject,
    text: "",
    html,
  });
};

module.exports = {
  sendActivationMail,
};
