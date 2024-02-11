const router = require("express").Router()
const customerCartSchema = require("../Schema/customerCart")
const UserSchema = require("../Schema/User")


router.get('/getcarts', async (req, res) => {
  try {
    let qid = req.query.id
    const data = await customerCartSchema.find({ customer_id: qid })
    res.status(200).json({ data: data, message: "carts found" })
  } catch (err) {
    res.status(400).json({ message: "bhai no carts err" })
  }
})

router.post('/createcart', async (req, res) => {
  const qid = req.query.id;
  const { product_id, quantity, price, product_name } = req.body;

  try {
    let data = await customerCartSchema.findOneAndUpdate(
      { customer_id: qid, 'items.product_id': product_id },
      {
        $inc: { 'items.$.quantity': quantity }
      },
      { new: true }
    );

    if (!data) {
      data = await customerCartSchema.findOneAndUpdate(
        { customer_id: qid },
        {
          $push: {
            items: {
              product_id,
              quantity,
              price,
              product_name
            }
          }
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ data, message: "Customer cart updated", status: 200 });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error occurred" });
  }
});


router.post('/updatequantity', async (req, res) => {
  // const qid = req.query.id;
  const { product_id, quantity  , CustomerId} = req.body;

  try {
    const data = await customerCartSchema.findOneAndUpdate(
      { customer_id: CustomerId, 'items.product_id': product_id },
      {
        $set: { 'items.$.quantity': quantity }
      },
      { new: true }
    );

    if (!data) {
      res.status(404).json({ message: "Product not found in the cart", status: 404 });
      return;
    }

    res.status(200).json({ data, message: "Quantity updated in the cart", status: 200 });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error occurred" });
  }
});




router.post('/updateItems', async (req, res) => {
  try {
    let qid = req.query.id
    let itemsArr = req.body.items

    const updateitem = await customerCartSchema.updateOne(
      { customer_id: qid },
      { $set: { items: itemsArr } }
    )

    res.status(200).json({ data: updateitem, message: "updateitemd" })
  } catch (err) {
    res.status(400).json({ message: "err found" })
  }
})


router.post('/savedProducts', async (req, res) => {
  try {
    const { productId, userId } = req.body;
    const user = await UserSchema.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const savedProducts = user?.savedProducts || [];
    const index = savedProducts?.indexOf(productId);

    // Toggle productId in savedProducts array
    if (index !== -1) {
      savedProducts.splice(index, 1); // Remove if productId exists
    } else {
      savedProducts.push(productId); // Add if productId does not exist
    }

    // Update the user document with the modified savedProducts array
    let stored = await UserSchema.findByIdAndUpdate(
      userId,
      { savedProducts },
      { new: true } // This option ensures that the updated document is returned
    );
  
    res.status(200).json({ message: 'Operation successful', savedProducts: stored.savedProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;