const express = require('express');
const path = require('path');
const router = express.Router();
const razorpay = require('../config/razorpaySetup'); 



// Route to create an order on Razorpay
router.post('/create-order', (req, res) => {
    const options = {
        amount: 50000, 
        currency: 'INR',
        receipt: 'order_rcptid_11',
    };

    razorpay.orders.create(options, function(err, order) {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({
            key_id: 'rzp_test_PrAFqiJ15E5L8G',  // Replace with  Razorpay Key ID
            amount: order.amount,
            orderId: order.id,
        });
    });
});

module.exports = router;
