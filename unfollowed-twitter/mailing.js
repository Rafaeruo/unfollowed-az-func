import mailer from "nodemailer";

const getTransport = () => {
  return mailer.createTransport({
    host: process.env.smtp_host, // hostname
    secureConnection: false,
    port: process.env.smtp_port,
    tls: {
      ciphers: "SSLv3",
    },
    auth: {
      user: process.env.smtp_username,
      pass: process.env.smtp_password,
    },
  });
};

export const sendMail = json => {
  const transport = getTransport();
  transport.sendMail({
    from: '"Twitter followers tracking" <rafael.tracking.twt@outlook.com>',
    to: process.env.mail,
    subject: "You lost a follower",
    html: "<p>Check the diff.json file</p>",
    attachments: [
      {
        filename: "unfollowed.json",
        content: json,
        contentType: "application/json",
      },
    ],
  });
};
