/**
 * Email Service using NodeMailer
 * 
 * All email sending is async and non-blocking.
 * Failures are logged but don't crash the application.
 * 
 * Configure environment variables:
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASS
 * - EMAIL_FROM
 */

const logger = require('../utils/logger');

// Note: nodemailer must be installed: npm install nodemailer
let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch (e) {
    logger.warn('nodemailer not installed. Email features disabled.');
    nodemailer = null;
}

// Email configuration
const config = {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // TLS
    auth: {
        user: process.env.SMTP_USER || 'your-email@example.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
    }
};

const fromAddress = process.env.EMAIL_FROM || 'VVIT Recruit <noreply@vvitrecruit.com>';

// Create transporter (lazy initialization)
let transporter = null;

const getTransporter = () => {
    if (!nodemailer) return null;

    if (!transporter) {
        transporter = nodemailer.createTransport(config);
    }
    return transporter;
};

/**
 * Send email (async, non-blocking)
 * Returns immediately, logs any errors
 */
const sendEmail = async ({ to, subject, text, html }) => {
    const transport = getTransporter();

    if (!transport) {
        logger.info(`Email mock - would send to ${to}: ${subject}`);
        return { success: false, mocked: true };
    }

    try {
        const info = await transport.sendMail({
            from: fromAddress,
            to,
            subject,
            text,
            html
        });

        logger.info(`Email sent to ${to}: ${subject} (${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error(`Email send failed to ${to}: ${error.message}`);
        return { success: false, error: error.message };
    }
};

/**
 * Send welcome email on registration
 */
const sendWelcomeEmail = async (user) => {
    if (!user?.email) return;

    const subject = 'Welcome to VVIT Campus Recruitment System!';
    const text = `
Hi ${user.name || 'there'},

Welcome to the VVIT Campus Recruitment System! Your account has been created successfully.

Role: ${user.role || 'student'}

Get started by:
${user.role === 'student'
            ? '- Uploading your resume\n- Browsing available jobs\n- Applying to positions that match your skills'
            : user.role === 'recruiter'
                ? '- Posting your first job\n- Reviewing applicants with AI-powered ranking\n- Scheduling interviews'
                : '- Managing users and jobs\n- Monitoring system statistics'}

Best regards,
VVIT Recruit Team
`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #4dd0e1 0%, #7c4dff 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">🎓 VVIT Campus Recruitment</h1>
  </div>
  <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
    <h2>Welcome, ${user.name || 'there'}!</h2>
    <p>Your account has been created successfully.</p>
    <p><strong>Role:</strong> ${user.role || 'student'}</p>
    <p>Get started by logging in and exploring the platform!</p>
    <br>
    <p style="color: #666;">Best regards,<br>VVIT Recruit Team</p>
  </div>
</body>
</html>
`;

    // Fire and forget - don't await in calling code
    sendEmail({ to: user.email, subject, text, html }).catch(() => { });
};

/**
 * Send login notification
 */
const sendLoginNotification = async (user, metadata = {}) => {
    if (!user?.email) return;

    const timestamp = new Date().toLocaleString();
    const subject = 'New Login to Your Account';
    const text = `
Hi ${user.name || 'there'},

A new login was detected on your VVIT Recruit account.

Time: ${timestamp}
${metadata.ip ? `IP: ${metadata.ip}` : ''}

If this wasn't you, please secure your account immediately.

Best regards,
VVIT Recruit Team
`;

    sendEmail({ to: user.email, subject, text }).catch(() => { });
};

/**
 * Send application status change email
 */
const sendApplicationStatusEmail = async ({ studentEmail, studentName, jobTitle, company, status }) => {
    if (!studentEmail) return;

    const subject = `Application Update: ${jobTitle}`;
    const text = `
Hi ${studentName || 'there'},

Your application status for "${jobTitle}" at ${company} has been updated.

New Status: ${status}

${status === 'Shortlisted'
            ? 'Congratulations! You have been shortlisted. The recruiter may contact you soon for next steps.'
            : status === 'Selected' || status === 'Hired'
                ? 'Fantastic news! You have been selected for this position. Congratulations!'
                : status === 'Rejected'
                    ? 'We appreciate your interest. Unfortunately, your application was not selected at this time. Keep applying to other positions!'
                    : 'The recruiter is reviewing your application.'}

Best regards,
VVIT Recruit Team
`;

    sendEmail({ to: studentEmail, subject, text }).catch(() => { });
};

/**
 * Send interview scheduling email
 */
const sendInterviewEmail = async ({ studentEmail, studentName, jobTitle, company, date, time, notes }) => {
    if (!studentEmail) return;

    const subject = `Interview Scheduled: ${jobTitle}`;
    const text = `
Hi ${studentName || 'there'},

An interview has been scheduled for your application to "${jobTitle}" at ${company}.

Date: ${date}
Time: ${time}
${notes ? `Notes: ${notes}` : ''}

Please be prepared and on time. Good luck!

Best regards,
VVIT Recruit Team
`;

    sendEmail({ to: studentEmail, subject, text }).catch(() => { });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendLoginNotification,
    sendApplicationStatusEmail,
    sendInterviewEmail
};
