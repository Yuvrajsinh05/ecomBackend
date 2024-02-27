const FilterSchema = require("../Schema/Filters")
const FashionProducts = require("../Schema/subCategories/Cloths")

const fetchDataObjectsOfTypeRangBrand = (type, subtype, foundCategory) => {
    if (subtype) {
        const subCategory = foundCategory.SubCategories.find(sub => sub.type === type);
        if (subCategory) {
            const subTypeData = subCategory.SubType.find(sub => sub.Name === subtype);
            if (subTypeData) {
                return subTypeData;
            } else {
                return "Subtype not found";
            }
        } else {
            return "Type not found";
        }
    } else {
        return foundCategory.SubCategories.find(sub => sub.type === type);
    }

}

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

const CreateFashionProduct = async(bodyData, matchType)=> {
    const { name, price, image, description, category, subcategory, type, SubType, brand } = bodyData
    if (!name || !price || !image || !description || !subcategory || !category || !type || !SubType || !brand) {
        const missingFields = [];
        if (!name) missingFields.push("name");
        if (!price) missingFields.push("price");
        if (!image) missingFields.push("image");
        if (!description) missingFields.push("description");
        if (!subcategory) missingFields.push("subcategory");
        if (!category) missingFields.push("category");
        if (!type) missingFields.push("type");
        if (!SubType) missingFields.push("SubType");
        if (!brand) missingFields.push("brand");
        throw { status: 400, message: `The following fields are mandatory: ${missingFields.join(", ")}.` };
    }
    if (!matchType?.Brands.includes(brand)) {
        throw { status: 400, message: "We Are Still Limited With Some Brands", PossibleBrands: matchType?.Brands };
    }

    const priceRanges = matchType?.Range.map(range => range.split(' - ').map(Number));
    let priceRangeToUpdate = null;
    for (const range of priceRanges) {
        const [min, max] = range;
        if (price >= min && price <= max) {
            priceRangeToUpdate = range.join(' - ');
            break;
        }
    }
    if (!priceRangeToUpdate) {
        throw { status: 400, message: "Price is not within any allowed range." };
    }

    const filter = { Category: category, type: type };
    const update = {
        $inc: {
            [`Brands.${brand}`]: 1,
            [`PriceRange.${priceRangeToUpdate}`]: 1
        }
    };
    const options = { new: true, upsert: true }; // Create the document if it doesn't exist
    const updatedDocument = await FilterSchema.findOneAndUpdate(filter, update, options);
    const newProduct = new FashionProducts({
        name: name,
        price: price,
        image: image,
        description: description,
        category: category,
        subcategory: subcategory,
        type: type,
        SubType: SubType,
        brand: brand
    });




    // Save the new product to the database
    await newProduct.save();

}



module.exports = { fetchDataObjectsOfTypeRangBrand ,shuffleArrayWithUniqueCheck , CreateFashionProduct}