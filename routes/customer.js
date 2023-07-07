const router  = require("express").Router()
const customerCartSchema = require("../Schema/customerCart")


router.get('/getcarts',async(req,res)=>{
  try{
    let qid = req.query.id
    const data = await customerCartSchema.find({customer_id:qid})
    res.status(200).json({data:data , message:"carts found"})  
  }catch(err){
    res.status(400).json({message:"bhai no carts err"})
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
          });
          await data.save(); // Save changes to the existing document
      } else {
          // Customer does not have a cart yet, create a new one
          data = {
              customer_id: qid,
              items: [
                  {
                      product_id: req.body.product_id,
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

      res.status(200).json({ data: datasave, message: "customerCart data found" ,status:200});
  } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Error occurred" });
  }
});

  



router.post('/updateItems',async(req,res)=>{
  try{
    let qid = req.query.id
    let itemsArr = req.body.items

    const updateitem = await customerCartSchema.updateOne(
      {customer_id:qid},
      {$set:{items:itemsArr}}  
    )

    res.status(200).json({data:updateitem , message:"updateitemd"})  
  }catch(err){
    res.status(400).json({message:"err found"})
  }
})
module.exports = router ;