"use strict";

const nodemailer = require("nodemailer");

// Verification email template
const verificationTemplate = (user, token) => {
  return `
    <div>
      <h2>Welcome to ${process.env.EMAIL_FROM}</h2>
      <p>Hi ${user.firstname}, please verify your email address:</p>
      <a href="${process.env.BACKEND_URL}/api/v1/users/verify?token=${token}">
        Verify Your Account
      </a>
    </div>
  `;
};

// Reset password template
const resetPasswordTemplate = (user, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  return `
    <div>
      <h2>Password Reset Request</h2>
      <p>Hi ${user.firstname},</p>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetLink}">Reset Your Password</a>
      <p>If you didn’t request this, ignore this email.</p>
    </div>
  `;
};

// Notification email templates
const notificationEmailTemplate = (notification, user) => {
  const priorityColors = {
    low: "#52c41a",
    medium: "#faad14",
    high: "#ff4d4f",
    urgent: "#cf1322",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: #1890ff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f5f5f5; }
        .notification { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${
          priorityColors[notification.priority]
        }; }
        .priority { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; background: ${
          priorityColors[notification.priority]
        }; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #1890ff; color: white; text-decoration: none; border-radius: 4px; margin-top: 16px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${process.env.APP_NAME || "LegalCase"}</h1>
        </div>
        <div class="content">
          <div class="notification">
            <span class="priority">${notification.priority.toUpperCase()}</span>
            <h2>${notification.title}</h2>
            <p>${notification.message || ""}</p>
            <p><strong>Type:</strong> ${notification.type}</p>
            <p><strong>Date:</strong> ${new Date(
              notification.createdAt
            ).toLocaleString()}</p>
            ${
              notification.actionUrl
                ? `<a href="${process.env.FRONTEND_URL}${notification.actionUrl}" class="button">View Details</a>`
                : ""
            }
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from ${
            process.env.APP_NAME || "LegalCase"
          }</p>
          <p><a href="${
            process.env.FRONTEND_URL
          }/settings/notifications">Manage notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Bulk notification template
const bulkNotificationsTemplate = (notifications, user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: #1890ff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f5f5f5; }
        .notification { background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #1890ff; }
        .count { background: #ff4d4f; color: white; padding: 4px 8px; border-radius: 50%; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #1890ff; color: white; text-decoration: none; border-radius: 4px; margin-top: 16px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${process.env.APP_NAME || "LegalCase"}</h1>
          <h2>You have ${notifications.length} new notifications</h2>
        </div>
        <div class="content">
          ${notifications
            .map(
              (notif) => `
            <div class="notification">
              <h3>${notif.title}</h3>
              <p>${notif.message || ""}</p>
              <small>Type: ${notif.type} • ${new Date(
                notif.createdAt
              ).toLocaleString()}</small>
            </div>
          `
            )
            .join("")}
          <div style="text-align: center;">
            <a href="${
              process.env.FRONTEND_URL
            }/notifications" class="button">View All Notifications</a>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from ${
            process.env.APP_NAME || "LegalCase"
          }</p>
          <p><a href="${
            process.env.FRONTEND_URL
          }/settings/notifications">Manage notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async ({
  to,
  subject,
  html,
  from = process.env.EMAIL_FROM,
}) => {
  try {
    const info = await transporter.sendMail({ from, to, subject, html });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  verificationTemplate,
  resetPasswordTemplate,
  notificationEmailTemplate,
  bulkNotificationsTemplate,
};
