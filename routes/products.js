const router = require("express").Router()
const computerSchema = require("../Schema/subCategories/Computers&Accessories")
const FilterSchema = require("../Schema/Filters")
const CategoriesSchema = require("../Schema/Categories")
const Mobileschema = require("../Schema/subCategories/Mobiles&Accessories")
const FashionProducts = require("../Schema/subCategories/Cloths")
const { createClient } = require('pexels')
const openAi = require('openai')
const { fetchDataObjectsOfTypeRangBrand, CreateComputerProduct, CreateFashionProduct, shuffleArrayWithUniqueCheck, CreateMobileProduct } = require("./common")


router.get('/Electronics/Computers&Accessories', async (req, res) => {
  try {
    const collection = await computerSchema.find()
    return res.status(200).json({ data: collection, message: "computer&Accessories data found" })
  } catch (err) {
    return res.status(400).json({ message: "error found" })
  }
})

router.get('/Electronics/Mobiles&Accessories', async (req, res) => {
  try {
    const collection = await Mobileschema.find()
    return res.status(200).json({ data: collection, message: "Mobiles data found" })
  } catch (err) {
    return res.status(400).json({ message: "error found" })
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
      return res.status(200).json({
        data: shuffledAndUniqueFashionDetail,
        count: shuffledAndUniqueFashionDetail.length,
        message: "Details fetched for all products"
      });
    } else {
      return res.status(404).json({ message: "No details found for the given ID" });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
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
    return res.status(200).json({
      data: allProducts,
      count: allProducts.length,
      message: "Details fetched for all products"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
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
    return res.status(200).json({ data: detail, message: "Details fetched" })
  } catch (err) {
    return res.status(400).json({ message: err })
  }
})

router.get('/Fashion/:id', async (req, res) => {
  let fid = req.params.id
  try {
    const datacol = await FashionProducts.find({ type: fid })
    return res.status(200).json({ data: datacol, message: "found cloths" })
  } catch (Err) {
    return res.status(400).json({ message: "error found" })
  }
})

router.get('/getFilterDetails', async (req, res) => {
  try {
    let Query = req.query.str
    const Filterd = await FilterSchema.find({ type: Query })
    return res.status(200).json({ data: Filterd, message: "Filtered Found" })
  } catch (err) {
    return res.status(400).json({ message: "Internal Server Problem" })
  }
})

router.get('/autoCreateProduct', async (req, res) => {
  try {
    const createFashionProduct = await CategoriesSchema.findOne({ Categories: "Fashion" })
    const getProduct = await generateRandomProductFashion(createFashionProduct)
    const reqWithProductData = {
      body: getProduct // Set getProduct as the body of the request
    };

    await createProduct(reqWithProductData, res);

  } catch (err) {
    console.log("Err", err)
    return res.status(500).json({ message: "Err Found While Auto Addinig Product", err })
  }
})

router.post('/filterProducts', async (req, res) => {
  try {
    const { category, subCategory, price, brands } = req.body;

    // Prepare brand filter
    const brandFilter = Array.isArray(brands) && brands.length > 0 ? { brand: { $in: brands } } : {};

    // Prepare price range filter
    const priceFilter = price && price.max && price.min && price.max !== 1.7976931348623157e+308 && price.min !== 5e-324 ?
      { price: { $gte: price.min, $lte: price.max } } : {};
      const bool = price.max==Number.MIN_VALUE && price.min==Number.MAX_VALUE
    // Construct the query

    let query ;

    if(bool){
       query = { 
        category, 
        type: subCategory, 
        ...brandFilter, 
      };
    }else{
      query= { 
        category, 
        type: subCategory, 
        ...brandFilter, 
        ...priceFilter 
      };
    }

    // Query the respective collections
    const FashionProduct = await FashionProducts.find(query);
    const ComputerProducts = await computerSchema.find(query);
    const MobilesProducts = await Mobileschema.find(query);
    
    // Combine the results and send the response
    const filteredProducts = [...FashionProduct, ...ComputerProducts, ...MobilesProducts];
    return res.status(200).json({ data: filteredProducts, message: "Filter Found" });
  } catch (err) {
    return res.status(400).json({ message: "Error Found While Filter Products" });
  }
});



const createProduct = async (req, res) => {
  try {
    const { category, type, SubType, subcategory } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Missing Category" });
    }

    const foundCategory = await CategoriesSchema.findOne({ Categories: category });
    if (!foundCategory) {
      return res.status(400).json({ message: "Limited For Category Fashion , Electronics , Beauty." });
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

    if (category == 'Fashion') {
      try {
        const MatchTypeObj = fetchDataObjectsOfTypeRangBrand(subcategory, type, foundCategory)
        const addFashionProduct = await CreateFashionProduct(req.body, MatchTypeObj)
        return res.status(200).json({ message: "Fashion Product Createad", data: MatchTypeObj })
      } catch (err) {
        return res.status(400).json({ Error: "Error While Creating Fashion Product", err });
      }

    } else if (category == 'Electronics') {
      if (type == 'Mobiles&Accessories') {
        try {
          const MatchTypeObj = fetchDataObjectsOfTypeRangBrand(type, false, foundCategory)
          const addMobiles = await CreateMobileProduct(req.body, MatchTypeObj)
          return res.status(200).json({ message: "Mobile Product Createad", data: addMobiles })
        } catch (err) {
          return res.status(400).json({ Error: "Error While Creating Mobile Product", err });
        }

      } else if (type == 'Computers&Accessories') {

        try {
          const MatchTypeObj = fetchDataObjectsOfTypeRangBrand(type, false, foundCategory)
          const addMobiles = await CreateComputerProduct(req.body, MatchTypeObj)
          return res.status(200).json({ message: "Mobile Product Createad", data: addMobiles })
        } catch (err) {
          console.log("Err", err)
          return res.status(400).json({ Error: "Error While Creating Cpmputer Product", err: err });
        }

      }
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error occurred in /admin/createProduct", err: err });
  }
}


async function chatWithOpenAiModal(promt) {
  console.log("promt", promt)
  // return;
  const ChatWithAi = new openAi({ apiKey: process.env.OPENAI })
  const completion = await ChatWithAi.chat.completions.create({
    messages: [{ role: "system", content: promt }],
    model: "gpt-3.5-turbo",
  });
  return await completion.choices[0].message.content;
}


async function GenrateImageForProduct(word) {
  try {
    const client = new createClient(process.env.PEXELKEY);
    const query = word;
    // Search for photos based on the query
    const generateImage = await client.photos.search({ query, per_page: 1 });
    // If no photos are found, throw an error with a specific message
    if (!generateImage || !generateImage?.photos || generateImage.photos.length === 0) {
      throw new Error('No images found for the given query');
    }
    // Extract the URL of the first photo
    const WebPageImage = generateImage.photos[0]?.src?.original;
    return WebPageImage;
  } catch (err) {
    // Log the error for debugging purposes
    console.error('Error in fetching image:', err.message);
    // Throw an error with a specific message
    throw { status: 400, message: "Failed While Generating Image" } // Generic error message
  }
}



function getRandomItemFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}



async function generateRandomProductFashion(reference) {
  try {
    // Get random category
    const category = reference.Categories;

    // Get random subcategory
    const subcategoryObj = getRandomItemFromArray(reference.SubCategories);
    const subcategory = subcategoryObj.type;

    // Get random type
    const typeObj = getRandomItemFromArray(subcategoryObj.SubType);
    const type = typeObj.Name;

    // Get random brand
    const brand = getRandomItemFromArray(typeObj.Brands);

    // Generate random price
    const price = Math.floor(Math.random() * 501); // Generates a random number between 0 and 500

    const GenerateSubType = await chatWithOpenAiModal(`Generate subtype for ${category} ${subcategory} ${type} in string only word`)
    const GenerateNameProduct = await chatWithOpenAiModal(`Generate Product name for ${category} ${subcategory} ${type} ${GenerateSubType} ${brand} ${price} in string only word`)
    const GenerateNameProductDescription = await chatWithOpenAiModal(`Generate Product description for ${category} ${subcategory} ${type} ${GenerateSubType} ${GenerateNameProduct} ${brand} ${price} in string  words only give description no other text strict Output`)
    const GenerateRandomWordForImage = await chatWithOpenAiModal(`Generate Product String Word TO Fetch A Image  Based on "${subcategory}" "${type}" "${GenerateNameProduct}" "${brand}"  only a Word No Other Text Strict Output Not Defficult Give Simple Word that is possible to get image with it very very simple we can find photos of that word`)

    console.log("images generattion stars with Word", GenerateRandomWordForImage)
    const GenerateImage = await GenrateImageForProduct(GenerateRandomWordForImage.trim().replace(/"/g, ''))
    console.log("images generattion ends...")
    // Construct and return the product schema
    return {
      category: category,
      subcategory: subcategory,
      SubType: type,
      type: type,
      brand: brand,
      price: price,
      name: GenerateNameProduct,
      description: GenerateNameProductDescription,
      image: GenerateImage
    };
  } catch (err) {
    console.log("Err creating fashion", err)
    throw err;
  }
}






router.post('/createProduct', createProduct);
module.exports = router;



