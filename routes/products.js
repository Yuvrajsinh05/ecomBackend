const router = require("express").Router()
const computerSchema = require("../Schema/subCategories/Computers&Accessories")
const FilterSchema = require("../Schema/Filters")
const CategoriesSchema = require("../Schema/Categories")
const Mobileschema = require("../Schema/subCategories/Mobiles&Accessories")
const FashionProducts = require("../Schema/subCategories/Cloths")
const { fetchDataObjectsOfTypeRangBrand , CreateFashionProduct ,shuffleArrayWithUniqueCheck} = require("./common")


router.get('/Electronics/Computers&Accessories', async (req, res) => {
  try {
    const collection = await computerSchema.find()
    res.status(200).json({ data: collection, message: "computer&Accessories data found" })
  } catch (err) {
    res.status(400).json({ message: "error found" })
  }
})

router.get('/Electronics/Mobiles&Accessories', async (req, res) => {
  try {
    const collection = await Mobileschema.find()
    res.status(200).json({ data: collection, message: "Mobiles data found" })
  } catch (err) {
    res.status(400).json({ message: "error found" })
  }
})

router.get('/allProducts', async (req, res) => {
  try {
    const query = req.query.idNameFashion;
    let fashionDetail;
    if (query === "Kids Fashion") {
      fashionDetail = await FashionProducts.find({ type: { $in: ["Children's Shoes", "Children's Clothing"] } });
    } else if (query === "Men Fashion") {
      fashionDetail = await FashionProducts.find({ type: { $in: ["Men's Clothing", "Men's Shoes"] } });
    } else if (query === "Women Fashion") {
      fashionDetail = await FashionProducts.find({ type: { $in: ["Women's Clothing", "Women's Shoes"] } });
    } else {
      const [fashionDetail, computerDetail, mobileDetail] = await Promise.all([
        FashionProducts.find(),
        computerSchema.find(),
        Mobileschema.find()
      ]);

      const mergedData = [...fashionDetail, ...computerDetail, ...mobileDetail];
      const shuffledAndUniqueData = shuffleArrayWithUniqueCheck(mergedData);

      if (shuffledAndUniqueData.length > 0) {
        return res.status(200).json({
          data: shuffledAndUniqueData,
          count: shuffledAndUniqueData.length,
          message: "Details fetched for all products"
        });
      } else {
        return res.status(404).json({ message: "No details found for the given ID" });
      }
    }

    const shuffledAndUniqueFashionDetail = shuffleArrayWithUniqueCheck(fashionDetail);

    if (shuffledAndUniqueFashionDetail.length > 0) {
      res.status(200).json({
        data: shuffledAndUniqueFashionDetail,
        count: shuffledAndUniqueFashionDetail.length,
        message: "Details fetched for all products"
      });
    } else {
      res.status(404).json({ message: "No details found for the given ID" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/fetchProductsWithIds', async (req, res) => {
  try {
    const { idArray } = req.query; // Use req.query instead of req.body for GET requests

    if (!idArray) {
      return res.status(400).json({ message: "idArray is required" });
    }

    const parsedIdArray = JSON.parse(idArray);

    // Fetch products from FashionProducts model
    const fashionProducts = await FashionProducts.find({ _id: { $in: parsedIdArray } });

    // Fetch products from ComputerSchema model
    const computerProducts = await computerSchema.find({ _id: { $in: parsedIdArray } });

    // Fetch products from MobileSchema model
    const mobileProducts = await Mobileschema.find({ _id: { $in: parsedIdArray } });

    // Combine the results
    const allProducts = [...fashionProducts, ...computerProducts, ...mobileProducts];
    res.status(200).json({
      data: allProducts,
      count: allProducts.length,
      message: "Details fetched for all products"
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/productDetails/:id', async (req, res) => {
  const prodID = req.params.id
  try {
    const detail = await FashionProducts.find({ _id: prodID })
    if (detail.length == 0) {
      const detail1 = await computerSchema.find({ _id: prodID })
      if (detail1.length == 0) {
        const detail2 = await Mobileschema.find({ _id: prodID })
        return res.status(200).json({ data: detail2, message: "Details for mobiles" })
      }
      return res.status(200).json({ data: detail1, message: "Details for Computers" })
    }
    res.status(200).json({ data: detail, message: "Details fetched" })
  } catch (err) {
    res.status(400).json({ message: err })
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

router.get('/getFilterDetails', async (req, res) => {
  try {
    let Query = req.query.str
    const Filterd = await FilterSchema.find({ type: Query })
    res.status(200).json({ data: Filterd, message: "Filtered Found" })
  } catch (err) {
    res.status(400).json({ message: "Internal Server Problem" })
  }
})

router.post('/createProduct', async (req, res) => {
  try {
    const { category, type, SubType, subcategory } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Missing Category" });
    }

    const foundCategory = await CategoriesSchema.findOne({ Categories: category });
    if (!foundCategory) {
      return res.status(400).json({ message: "Category not found." });
    }


    if (!foundCategory.SubCategories[0].SubType) {
      const possibleTypes = foundCategory.SubCategories.map(subCate => subCate.type);
      if (!possibleTypes.includes(type)) {
        return res.status(400).json({ message: "We are not selling this Category Type.", possibleTypes });
      }
    }

    if (foundCategory.SubCategories[0].SubType) {
      const subCateGoryExists = foundCategory.SubCategories.map(subcate => subcate.type)
      if (!subCateGoryExists.includes(subcategory)) {
       return res.status(400).json({ message: "We are not selling this subcategory Products", subCateGoryExists })
      }
      const CloneSubCate = foundCategory.SubCategories.find(subCategory => subCategory.type === subcategory);
      const PossibleType = CloneSubCate.SubType.map(type => type.Name)

      if (!PossibleType.includes(type)) {
       return res.status(400).json({ message: "We are not selling this Types Products", PossibleType })
      }
    }


    // return res.status(200).json({message:"sending something" , data:foundCategory})

    const MatchTypeObj = fetchDataObjectsOfTypeRangBrand(subcategory, type, foundCategory)

    if (category == 'Fashion') {
      try {
        const addFashionProduct = await CreateFashionProduct(req.body, MatchTypeObj)
        return res.status(200).json({ message: "Product Createad", data: addFashionProduct })
      } catch (err) {

        console.log("Erer",err)
        return res.status(400).json({ Error: "Error While Creating Fashion Product", err });
      }

    } else if (category == 'Electronics') {
      if (type == 'Mobiles&Accessories') {

      } else if (type == 'Computers&Accessories') {

      }
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error occurred in /admin/createProduct", err: err });
  }
});



module.exports = router;



