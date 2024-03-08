const router = require("express").Router()
const customerCartSchema = require("../Schema/customerCart")
const FashionProducts = require("../Schema/subCategories/Cloths")
const Mobileschema = require("../Schema/subCategories/Mobiles&Accessories")
const computerSchema = require("../Schema/subCategories/Computers&Accessories")
const UserSchema = require("../Schema/User")
const orderSchema = require("../Schema/Order")


async function FetchForCustom(parsedIdArray) {
  const fashionProducts = await FashionProducts.find({ _id: { $in: parsedIdArray } });

  // Fetch products from ComputerSchema model
  const computerProducts = await computerSchema.find({ _id: { $in: parsedIdArray } });

  // Fetch products from MobileSchema model
  const mobileProducts = await Mobileschema.find({ _id: { $in: parsedIdArray } });

  // Combine the results
  const allProducts = [...fashionProducts, ...computerProducts, ...mobileProducts];
  return allProducts;
}
const replaceProductIds = async (orderItems, Products) => {
  const FinalItems = await Promise.all(orderItems.map(async item => {
    const newData = Products.find(d => d._id.toString() === item.product_id.toString());
    const CloneKey = {
      quantity: item.quantity
    }
    if (newData) {
      delete item.product_id;
      return { ...CloneKey, ...newData.toObject() };
    }
    return item.toObject();
  }));
  return FinalItems;
};


router.get('/getcarts', async (req, res) => {
  try {
    let qid = req.query.id;
    const FoundCart = await customerCartSchema.find({ customer_id: qid });
    const IdArray = FoundCart[0]?.items?.map(datas => datas.product_id);
    const Products = await FetchForCustom(IdArray);
    // Create a copy of the cart object
    let ClonCart = { ...FoundCart[0]?.toObject() };

    const newItems = await replaceProductIds(FoundCart[0].items, Products)
    // Update ClonCart's items to ["LOCA", "Toca"]
    ClonCart.items = [...newItems];

    return res.status(200).json({ data: ClonCart, message: "Cart Found" });
  } catch (err) {
    console.error(err); // Log any errors
    return res.status(400).json({ message: "No carts found or an error occurred" });
  }
});


router.post('/createcart', async (req, res) => {
  const qid = req.query.id;
  const { product_id, quantity, price, product_name, Prodcategory, Prodtype } = req.body;


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
              product_name,
              Prodcategory,
              Prodtype

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
  const { product_id, quantity, CustomerId } = req.body;

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

router.get('/orders', async (req, res) => {
  try {
    const { userID } = req.customer
    const orders = await orderSchema.find({ customer_id: userID });
    return res.status(200).json({ data: orders, message: "Order Fetched Succesfully" })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = router;