const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || "465",
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'indian.bangali.riders.2025@gmail.com',
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (options) => {
  // If no real SMTP config is provided, we just mock it for testing console output
  if (!process.env.SMTP_HOST) {
    console.log(`\n📧 [MOCK EMAIL] To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    return true;
  }

  const mailOptions = {
    from: 'INDIAN BANGALI RIDERS <indian.bangali.riders.2025@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message.replace(/\n/g, '<br/>')}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
};

module.exports = sendEmail;
