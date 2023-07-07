const router = require("express").Router()
const computerSchema = require("../Schema/subCategories/Computers&Accessories")
const Mobileschema = require("../Schema/subCategories/Mobiles&Accessories")
const jwt = require('jsonwebtoken')
const FashionProducts = require("../Schema/subCategories/Cloths")


// Define the middleware function
function verifyToken(req, res, next) {  
  // Get the JWT from the Authorization header
  if (req.path === '/login' || req.path === '/register' || req.path==='/isVerifiedRegister') {
    return next();
  } 
  let token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Verify the JWT
  jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN, function(err, decoded) {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach the decoded payload to the request object and proceed to the next middleware
    req.user = decoded;
     return next();
  });
}


// router.use(verifyToken)


// router.use(verifyToken)

// computer&Accessories start here 
router.get('/computer&Accessories',verifyToken, async (req, res) => {
  try {
    const collection = await computerSchema.find()
    res.status(200).json({ data: collection, message: "computer&Accessories data found" })
  } catch (err) {
    res.status(400).json({ message: "error found" })
  }
})
// computer&Accessories ends here .........




// Mobileschema start here 
router.get('/mobiles', async (req, res) => {
  try {
    const collection = await Mobileschema.find()
    res.status(200).json({ data: collection, message: "Mobiles data found" })
  } catch (err) {
    res.status(400).json({ message: "error found" })
  }
})
// Mobileschema ends here .........




router.get('/fashion', async (req, res) => {
  const qid = req.query.id
  try {
    const collection = await FashionProducts.find({ $or: [{ type: qid }] })
    res.status(200).json({ data: collection, message: "fashion data found" })
  } catch (err) {
    res.status(400).json({ message: "error found" })
  }
})





router.get('/productDetails/:id', async (req, res) => {
  const prodID = req.params.id
  try {
    const detail = await FashionProducts.find({ _id: prodID })
    if(detail.length==0){
      const detail1 = await computerSchema.find({_id:prodID})
      if(detail1.length==0){
        const detail2 = await Mobileschema.find( {_id:prodID})
        return res.status(200).json({data: detail2 , message : "Details for mobiles"})
      }
      return res.status(200).json({data:detail1 , message : "Details for Computers"})
    }
    res.status(200).json({ data: detail, message: "Details fetched" })
  } catch (err) {
    res.status(400).json({ message: err })
  }
})



// app.put('/updatemore', async (req, res) => {
//   try {
//     let datacol = await Mobileschema.updateMany(
//       {
//         $set: { type: "Mobiles&Accessories" }
//       }
//     )
//     res.status(200).json({ data: datacol, message: "updated filesss" })
//   } catch (Err) {
//     res.status(400).json({ message: "error catched" })
//   }
// })

router.get('/Electronics/:id', async (req, res) => {
  let mid = req.params.id
  try {
    if (mid == "Mobiles&Accessories") {
      const datacol = await Mobileschema.find({ type: mid })
      res.status(200).json({ data: datacol, message: "found mobiles" })
    } else if (mid == "Computers&Accessories") {
      const datacol = await computerSchema.find({ type: mid })
      res.status(200).json({ data: datacol, message: "found mobiles" })
    }
  } catch (Err) {
    res.status(400).json({ message: "error found" })
  }
})




router.get('/Fashion/:id', async (req, res) => {
  let fid = req.params.id
  try {
    const datacol = await FashionProducts.find({ type: fid })
    res.status(200).json({ data: datacol, message: "found cloths" })
  } catch (Err) {
    res.status(400).json({ message: "error found" })
  }
})



module.exports = router;