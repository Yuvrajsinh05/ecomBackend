const router = require("express").Router()
const computerSchema = require("../Schema/subCategories/Computers&Accessories")
const FilterSchema = require("../Schema/Filters")
const CategoriesSchema = require("../Schema/Categories")
const Mobileschema = require("../Schema/subCategories/Mobiles&Accessories")
const jwt = require('jsonwebtoken')
const FashionProducts = require("../Schema/subCategories/Cloths")




// computer&Accessories start here 

router.get('/Electronics/Computers&Accessories', async (req, res) => {
  try {
    const collection = await computerSchema.find()
    res.status(200).json({ data: collection, message: "computer&Accessories data found" })
  } catch (err) {
    res.status(400).json({ message: "error found" })
  }
})
// computer&Accessories ends here .........

// Mobileschema start here 
router.get('/Electronics/Mobiles&Accessories', async (req, res) => {
  try {
    const collection = await Mobileschema.find()
    res.status(200).json({ data: collection, message: "Mobiles data found" })
  } catch (err) {
    res.status(400).json({ message: "error found" })
  }
})
// Mobileschema ends here .........

const shuffleArrayWithUniqueCheck = (array) => {
  const uniqueSet = new Set();
  const shuffledArray = [];

  for (const item of array) {
    if (!uniqueSet.has(item._id)) {
      uniqueSet.add(item._id);
      shuffledArray.push(item);
    }
  }

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray;
};

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






// Function to filter data based on type
function filterDataByType(data, targetType) {
  const category = data.find(category => {
    const subCategory = category.SubCategories.find(subCategory => subCategory.type === targetType);
    return subCategory;
  });
  if (category) {
    const filteredSubCategory = category.SubCategories.find(subCategory => subCategory.type === targetType);
    return filteredSubCategory;
  }
  if (!category) {
    let ValueData;
    const subCategory = data.find(sub => {
      const LastObj = sub.SubCategories.find(su => {
        const valuedata = su.SubType.find(s => {
          return s.Name === targetType;
        })
        ValueData = valuedata
        return valuedata;
        // if (valuedata) return valuedata;
        return;
      })

      if (ValueData) return ValueData;
      return;
    }

    );

    return ValueData;
  }

}


function filterMobiles(computers, priceRange, brands) {
  const filteredData = {
    // type: "Mobiles&Accessories",
    // type: "Computers&Accessories",
    type: "Men's Clothing",
    Category: "Fashion",
    PriceRange: {},
    Brands: {}
  };

  for (const range of priceRange) {
    filteredData.PriceRange[range] = 0;
  }

  for (const brand of brands) {
    filteredData.Brands[brand] = 0;
  }


  for (const mobile of computers) {
    const mobilePrice = parseInt(mobile.price);

    for (const range of priceRange) {
      const [min, max] = range.split(" - ").map(Number);

      if (mobilePrice >= min && mobilePrice <= max) {
        filteredData.PriceRange[range]++;
        break; // Mobile can belong to only one price range
      }
    }

    const brand = mobile.brand;
    if (brands.includes(brand)) {
      filteredData.Brands[brand]++;
    }
  }

  return filteredData;
}

router.post('/filter', async (req, res) => {
  try {
    // const mobiles = await Mobileschema.find();
    // const Computers = await computerSchema.find();
    const fashion = await FashionProducts.find();
    const categories = await CategoriesSchema.find();

    // const filterData = filterDataByType(categories, "Mobiles&Accessories");
    // const filterData = filterDataByType(categories, "Computers&Accessories");
    const filterData = filterDataByType(categories, "Men's Clothing");


    const brands = filterData?.Brands;
    const priceRange = filterData?.Range;

    // const filteredMobiles = filterMobiles(mobiles, priceRange, brands);
    // const filteredComputers = filterMobiles(Computers, priceRange, brands);
    // const filteredFashion = filterMobiles(fashion, priceRange, brands);


    // let saveFilters  = new FilterSchema(filteredMobiles)
    // let saveFilters  = new FilterSchema(filteredComputers)
    // let saveFilters  = new FilterSchema(filteredFashion)

    // await saveFilters.save()
    res.status(200).json({ data: filterData });
  } catch (err) {
    console.log("Error:", err);
    res.status(400).json({ message: err });
  }
});








module.exports = router;









// http://localhost:8670/admin/Fashion/Jewelry