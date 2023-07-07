const router = require("express").Router()
const CategoriesSchema = require('../Schema/Categories')
const HomeCorouselSchema = require("../Schema/homecorousel")
const jwt = require('jsonwebtoken')


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


router.use(verifyToken)


router.get('/Categories', async (req, res) => {
  let data = await CategoriesSchema.find()
  res.send(JSON.stringify(data))
  res.end()
})



router.post('/createCategories', async (req, res) => {

  let randomString = generateRandomString();

  let data = {
    Categories: req.body.Categories,
    SubCategories: req.body.SubCategories,
    Products: req.body.Products,
    CategoriesId: randomString
  }

  function generateRandomString() {
    // function generates random string like "CATG23906056"
    let result = "CATG";
    for (let i = 0; i < 8; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }

  try {
    const createCate = new CategoriesSchema(data)
    let response = await createCate.save()
    return res.status(200).json({ message: "new category has been created", data: response })
  } catch (error) {
    return res.status(401).json({ message: "error found while creating new category" })
  }
})




// homeCorousel starts here
router.get('/homecorousel', async (req, res) => {
  let data = await HomeCorouselSchema.find()
  res.send((JSON.stringify(data)))
  res.end()
})
// homeCarousel ends here






module.exports = router;