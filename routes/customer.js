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
  try {
    let data = await customerCartSchema.findOne({ customer_id: qid });
    if (data) {
      // Customer has an existing cart, update the items
      data.items.push({
        product_id: req.body.product_id,
        quantity: req.body.quantity,
        price: req.body.price,
        product_name: req.body.product_name
      });
      await data.save(); // Save changes to the existing document
    } else {
      // Customer does not have a cart yet, create a new one
      data = {
        customer_id: qid,
        items: [
          {
            product_id: req.body.product_id,
            product_name: req.body.product_name,
            quantity: req.body.quantity,
            price: req.body.price,

          },
        ],
      };
      await customerCartSchema.create(data); // Create a new document
    }


    const datasave = await customerCartSchema.updateOne(
      { customer_id: qid },
      { $set: { items: data.items } }, // Only update the 'items' field
      { upsert: true }
    );

    res.status(200).json({ data: datasave, message: "customerCart data found", status: 200 });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error occurred" });
  }
});


// router.post('/savedProducts',async(req,res)=>{
//  try{
//    const [ProductId  , isSaved ] = req.body;
//   //  UserSchema.find 
//  }catch(err){
//   res.status(400).json({message:"Internal server problem"})
//  } 
// })

router.post('/savedProducts', async (req, res) => {
  try {
    const { productId, userId } = req.body;
    const user = await UserSchema.findById(userId);

    // console.log("productId",productId,userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("productId",productId)
    const savedProducts = user?.savedProducts || [];
    const index = savedProducts?.indexOf(productId);

  
    // console.log("savedProducts", savedProducts.length  ,savedProducts)
    // Toggle productId in savedProducts array
    if (index !== -1) {
      savedProducts.splice(index, 1); // Remove if productId exists
    } else {
      savedProducts.push(productId); // Add if productId does not exist
    }
    // console.log("savedProductsid", savedProducts.length ,savedProducts)
    // console.log("productId",productId,userId)
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
module.exports = router;