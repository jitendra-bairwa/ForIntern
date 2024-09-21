const express = require('express');
const path = require('path'); // Import 'path' module to serve the static file
const session = require('express-session');
const passport = require('passport');
const generatePdf = require('./utils/generatePdf.js')
const sendEmail =  require('./utils/sendEmail.js')

const googleAuthRoutes = require('./routes/googleAuth'); 
const authRoutes = require('./routes/auth'); 
const razorpay = require('./config/razorpaySetup'); 
const cookieParser = require("cookie-parser");

const app = express();
// Define a port for the server
const PORT = process.env.PORT || 3000;


// Middleware setup
// Middleware to parse JSON data
app.use(express.json());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'simpleSecret123',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());



// Define a route
// app.get('/', (req, res) => {
//     res.send('Hello, World!');
//   });



// Route to serve the payment page
app.get('/payment', (req, res) => {

  // console.log('User session in payment route:', req.session.user);
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

// Route to create an order on Razorpay
app.post('/create-order', async (req, res) => {

  const user = req.session.user;
  const options = {
    amount: 50000,  
    currency: "INR",
    receipt: "order_rcptid_11",
  };


  try {
    const order = await razorpay.orders.create(options); 

    // Send email with PDF after payment is successful
    const email = req.session.user.email; 
    const pdfPath = generatePdf(email, order.amount, order.id);
    await sendEmail(email, 'Payment Successful', 'Your payment has been processed successfully.', pdfPath);

    res.json({
      key: 'rzp_test_PrAFqiJ15E5L8G',  //Razorpay Key ID 

      amount: order.amount,
      orderId: order.id,
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).send('Error creating order');
  }
});


app.get('/payment-success', (req, res) => {
  // Render the payment success page
  res.sendFile(path.join(__dirname, 'public', 'payment-success.html')); 
});



// Route for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html')); 
});




app.use('/auth', authRoutes); // Use the auth routes
app.use('/auth/google', googleAuthRoutes); // Use the Google auth routes




// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
