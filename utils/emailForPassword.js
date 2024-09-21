const nodemailer = require("nodemailer");

const sendEmailPassword = async (subject, message, send_to, sent_from, reply_to) => {
  // Create Email Transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'jitendrabairwa225@gmail.com', 
      pass: 'btsq lioo zwlh nhoj'  
    }
  });


  let mailOptions = {
    from: sent_from,
    to: send_to,
    replyTo: reply_to,
    subject: subject,
    html: message,
  };


  // send email
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmailPassword;
