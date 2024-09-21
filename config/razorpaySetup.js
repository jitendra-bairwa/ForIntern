const Razorpay = require('razorpay');

// Create a Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: 'rzp_test_PrAFqiJ15E5L8G',  // Replace with your Razorpay Key ID
    key_secret: 'wRfs8DxQTY0nZWsyFS7tDbtT'  // Replace with your Razorpay Key Secret
});

// Export the Razorpay instance
module.exports = razorpayInstance;
