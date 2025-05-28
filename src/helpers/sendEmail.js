"use strict";

const nodemailer = require("nodemailer");

const verificationTemplate = (user, token) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">
            Welcome to ${process.env.EMAIL_FROM}!
        </h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #34495e;">
            Hi ${user.firstname},<br><br>
            Thank you for registering with us. Please verify your email address to complete your account setup.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.SERVER_URL
            }/api/v1/users/verify?token=${token}" 
               style="background-color: #3498db; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 4px; 
                      font-weight: bold;
                      display: inline-block;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                      transition: background-color 0.3s;">
                Verify Your Account
            </a>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #7f8c8d;">
            If you didn't create an account with us, please ignore this email or contact support if you have questions.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; text-align: center;">
            <p style="font-size: 12px; color: #95a5a6;">
                © ${new Date().getFullYear()} Codencia Legal Consultancy.
            </p>
        </div>
    </div>
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

const sendEmail = async ({ to, subject, html, from }) => {
  const info = await transporter.sendMail({ from, to, subject, html });
};

module.exports = { sendEmail, verificationTemplate };
