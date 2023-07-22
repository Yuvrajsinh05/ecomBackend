const router = require('express').Router()
const Razorpay = require('razorpay');
const crypto = require('crypto')
const paymentSchema = require("../Schema/paymentModal")
const commonMailFunctionToAll = require('../libs/maillib').commonMailFunctionToAll

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
  console.log("callend........")
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature ,email } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    console.log("callend........",2)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.YOUR_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
      console.log("callend........",3)
    // const isAuthentic = expectedSignature === razorpay_signature;
    console.log("callend........",4)
    // if (isAuthentic) {
      // Database comes here

      console.log("callend........")
      const data = {
        Subject: "order recevied",
        name: "dear customer",
        first_name: `hope you are doing well`,
        razorpay_order_id:razorpay_order_id,
        razorpay_payment_id:razorpay_payment_id,
        email: email
      };


       let ordered =await commonMailFunctionToAll(data, "ordered");
       console.log("order",ordered)
      await paymentSchema.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        email
      })
      res.status(200).redirect(`http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`);
    // }
    res.end()
  } catch (err) {
    res.status(400).json({ message: "error" })
  }
}) 


module.exports = router;