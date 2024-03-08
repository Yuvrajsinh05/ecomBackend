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
    const { userID } = req.customer

    const razorOrder = await instance.orders.create(options);

    if (!amount || !fName || !lName || !Email || !PhoneNo || !AdrsLine1 || !Country || !City || !State || !Pin) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!Array.isArray(cartProducts) || cartProducts.length === 0) {
      return res.status(400).json({ message: "Their is No Product in your cart to Procces Order." });
    }

    for (const product of cartProducts) {
      if (!product._id || !product.quantity || !product.price) {
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
        product_id: product._id,
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

    await order.save();
    await CustomerCart.findOneAndDelete({ customer_id: userID });

    return res.status(200).json({
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

    const isExisitingOrder = await orderSchema.findOne({ razorOrderId: razorpay_order_id });

    if (!isExisitingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.YOUR_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
      // Update order status to "accepted" and payment status to "completed"
      await orderSchema.findOneAndUpdate(
        { razorOrderId: razorpay_order_id },
        { $set: { orderStatus: 'accepted', 'paymentStatus': 'completed' } }
      );

      // Create payment record
      const paymentCompleted = await paymentSchema.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });


      // const termsAndConditions = [
      //   "All services will include free pick-up and delivery.",
      //   "All devices received by Phixman will be sent directly to diagnostic department. After diagnostic if there will be any other damage, other than mentioned, the customer is responsible.",
      //   "90 days warranty provided for Touch and LCD components. For all other components, the warranty period is 45 days. Alternatively, purchase our Paid protection plan for complete 1 year or more. Contact the store manager for details.",
      //   "One Time Free Replacement of glass within guarantee period. Warranty voids for Touch & LCD if the device is in Accidental Damage or Water Damage. Any Linings on Display are not covered in Warranty.",
      //   "6 months warranty provided for glass replacements only."
      // ];
      const data = {
        OrderId: isExisitingOrder.razorOrderId,
        email: isExisitingOrder.billingDetails.email,
        Subject: "Order Placed",
        fName: isExisitingOrder.billingDetails.fName,
        lName: isExisitingOrder.billingDetails.lName,
        ContactNo: isExisitingOrder.billingDetails.ContactNo,
        ordered: isExisitingOrder.items,
        // termsAndConditions: termsAndConditions
      }


      commonMailFunctionToAll(data, 'orderplace')
       return res.redirect(process.env.LOCALCLIENT);
    } else {
      return res.status(403).json({ message: "Signature mismatch" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;






