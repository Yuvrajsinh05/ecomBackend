const router = require('express').Router()
const Razorpay = require('razorpay');
const crypto = require('crypto')
const paymentSchema = require("../Schema/paymentModal")

// import {crypto} from "crypto";




router.post('/doPay', async (req, res) => {
  var instance = new Razorpay({
    key_id: process.env.YOUR_KEY_ID,
    key_secret: process.env.YOUR_KEY_SECRET,
  });
  var options = {
    amount: Number(req.body.amount * 100),  // amount in the smallest currency unit
    currency: "INR",
  };
  let order = await instance.orders.create(options)
  res.status(200).json({
    success: true,
    order
  })
})

router.get('/getKey', async (req, res) => {
  res.status(200).json({
    success: true,
    key: process.env.YOUR_KEY_ID
  })
})

router.post('/paymentVerification', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.YOUR_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Database comes here

      await paymentSchema.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      })
      res.status(200).redirect(`http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`);
    }
    res.end()
  } catch (err) {
    res.status(400).json({ message: "error" })
  }
}) 


module.exports = router;