const router = require("express").Router()
const CategoriesSchema = require('../Schema/Categories')
const HomeCorouselSchema = require("../Schema/homecorousel")
const jwt = require('jsonwebtoken')


router.get('/Categories', async (req, res) => {
  let data = await CategoriesSchema.find()
  res.send(JSON.stringify(data))
  res.end()
})

router.get('/category', async (req, res) => {
  try {
    const queryCategory = req.query.id;
    const queryName = req.query.name;
    const queryType = req.query.type;

    // Find the target category within the data array and populate SubCategories
    const targetCategoryData = await CategoriesSchema.findOne({ Categories: queryCategory });

    if (!targetCategoryData) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const matchingSubType = targetCategoryData.SubCategories
      .find(subCategory => subCategory.type === queryType)
      ?.SubType.find(subType => subType.Name === queryName);

    if (!matchingSubType) {
      return res.status(404).json({ error: 'SubType not found' });
    }

    res.status(200).json({ data: matchingSubType, message: 'OK' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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

router.get('/homecorousel', async (req, res) => {
  let data = await HomeCorouselSchema.find()
  res.send((JSON.stringify(data)))
  res.end()
})


module.exports = router;