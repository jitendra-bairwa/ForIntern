const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text, attachmentPath) {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'jitendrabairwa225@gmail.com',
                pass: 'btsq lioo zwlh nhoj'
            }
        });

        let mailOptions = {
            from: 'jitendrabairwa225@gmail.com',
            to: to,
            subject: subject,
            text: text,
            attachments: [{
                filename: 'invoice.pdf',
                path: attachmentPath
            }]
        };

        // Send email
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = sendEmail;

