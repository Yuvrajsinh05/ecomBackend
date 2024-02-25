const router = require('express').Router()
const Razorpay = require('razorpay');
const crypto = require('crypto')
const paymentSchema = require("../Schema/paymentModal")
const orderSchema = require("../Schema/Order")
const CustomerCart = require("../Schema/customerCart");
const { commonMailFunctionToAll } = require('../libs/maillib');

router.post('/doPay', async (req, res) => {
  try {
    const {
      amount,
      fName,
      lName,
      Email,
      PhoneNo,
      AdrsLine1,
      AdrsLine2,
      Country,
      City,
      State,
      Pin,
      cartProducts
    } = req.body;

    const instance = new Razorpay({
      key_id: process.env.YOUR_KEY_ID,
      key_secret: process.env.YOUR_KEY_SECRET,
    });
    const options = {
      amount: Number(amount * 100), // amount in the smallest currency unit
      currency: "INR",
    };
    const { userID }  = req.customer
  
    const razorOrder = await instance.orders.create(options);
    
    if (!amount || !fName || !lName || !Email || !PhoneNo || !AdrsLine1 || !Country || !City || !State || !Pin) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!Array.isArray(cartProducts) || cartProducts.length === 0) {
      return res.status(400).json({ message: "Their is No Product in your cart to Procces Order." });
    }

    for (const product of cartProducts) {
      if (!product.product_id || !product.quantity || !product.price) {
        return res.status(400).json({ message: "Each cart product must have product_id, quantity, price." });
      }
    }


    const order = new orderSchema({
      razorOrderId: razorOrder.id,
      customer_id: userID,
      date: new Date().toISOString(),
      total_price: amount,
      orderStatus: 'pending',
      paymentStatus: 'pending', 
      items: cartProducts?.map(product => ({
        product_id: product.product_id,
        quantity: product.quantity,
        price: product.price
      })),
      billingDetails: {
        fName,
        lName,
        email: Email,
        ContactNo: PhoneNo,
        address: {
          street: AdrsLine1 + " / " + AdrsLine2,
          city: City,
          state: State,
          zipcode: Pin,
          country: Country
        }
      }
    });

    const placeOrder =  await order.save();
    const cartDeleted = await CustomerCart.findOneAndDelete({ customer_id: userID });
  

    const termsAndConditions = [
      "All services will include free pick-up and delivery.",
      "All devices received by Phixman will be sent directly to diagnostic department. After diagnostic if there will be any other damage, other than mentioned, the customer is responsible.",
      "90 days warranty provided for Touch and LCD components. For all other components, the warranty period is 45 days. Alternatively, purchase our Paid protection plan for complete 1 year or more. Contact the store manager for details.",
      "One Time Free Replacement of glass within guarantee period. Warranty voids for Touch & LCD if the device is in Accidental Damage or Water Damage. Any Linings on Display are not covered in Warranty.",
      "6 months warranty provided for glass replacements only."
  ];
  
    const data = {
      OrderId: razorOrder.id,
      email:Email,
      Subject:"Order Placed",
      fName,
      lName,
      email: Email,
      ContactNo: PhoneNo,
      ordered : cartProducts,
      termsAndConditions:termsAndConditions
    }
    

    commonMailFunctionToAll(data  ,'orderplaced')
    res.status(200).json({
      success: true,
      order: razorOrder
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

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