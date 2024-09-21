const express = require('express');
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const { verifyRecaptcha } = require('../utils/Captcha'); // Import the verifyRecaptcha function
const Token = require('../models/tokenModel')
const sendEmailPassword = require('../utils/emailForPassword')

const router = express.Router();


// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, 'jitendra', { expiresIn: "1d" });
};

// Route to register a new user
router.post('/register', async (req, res) => {
    const { email, password,'g-recaptcha-response': recaptchaToken } = req.body;

    try {
        // Verify reCAPTCHA
        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isRecaptchaValid) {
            return res.status(400).send('reCAPTCHA verification failed');
        }

        // Create new user
        const user = await User.create({
            email,
            password,
        });

        res.send('User registered successfully');
    } catch (err) {
        res.status(400).send('Error registering user: ' + err.message);
    }
})



// Route to login a user
router.post('/login', async (req, res) => {
    const { email, password,'g-recaptcha-response': recaptchaToken } = req.body;
 
    try {
        // Verify reCAPTCHA
        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isRecaptchaValid) {
            return res.status(400).send('reCAPTCHA verification failed');
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).send('Invalid email or password');
        }

        // Set user information in the session
        req.session.user = {
            id: user._id,
            email: user.email
        };


        //   Generate Token
        const token = generateToken(user._id);

        // Send HTTP-only cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true,
        });


        //   If login is successful, redirect to payment page
        res.redirect('/payment');
    } catch (err) {
        res.status(500).send('Server error');
    }
})


// Route to forgotpassword
router.post('/forgotpassword', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404).send('User does not exist');
    }

    // Delete token if it exists in DB
    let token = await Token.findOne({ userId: user._id });
    if (token) {
        await token.deleteOne();
    }

    // Create Reste Token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    // Hash token before saving to DB
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");


    // Save Token to DB
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000), // Thirty minutes
    }).save();

    // Construct Reset Url
    const resetUrl = `${'http://localhost:3000'}/resetpassword/${resetToken}`;

    // Reset Email
    const message = `
    <h2>Hello ${user.name}</h2>
    <p>Please use the url below to reset your password</p>  
    <p>This reset link is valid for only 30minutes.</p>

    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

    <p>Regards...</p>
  `;
    const subject = "Password Reset Request";
    const send_to = user.email;
    const sent_from = "jitendrabairwa225@gmail.com";

    try {
        await sendEmailPassword(subject, message, send_to, sent_from);
        res.status(200).json({ success: true, message: "Reset Email Sent" });
    } catch (error) {
        res.status(500).send('Email not sent, please try again')
    }
})

// Route to resetpassword
router.put("/resetpassword/:resetToken", async (req, res) => {
    const { password } = req.body;
    const { resetToken } = req.params;

    // Hash token, then compare to Token in DB
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // fIND tOKEN in DB
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: { $gt: Date.now() },
    });


    if (!userToken) {
        res.status(404).send('Invalid or Expired Token')
    }


    // Find user
    const user = await User.findOne({ _id: userToken.userId });
    user.password = password;
    await user.save();
    res.status(200).json({
        message: "Password Reset Successful, Please Login",
    });
})


// route to check login status
router.get("/loginstatus", async (req, res) => {
    // console.log(req.cookies);
    const token = req.cookies.token;
    if (!token) {
        return res.json(false);
    }
    return res.json(true);
});


// route to logout
router.get("/logout", async (req, res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true,
    });
    return res.status(200).json({ message: "Successfully Logged Out" });
})



// Export the router
module.exports = router;
