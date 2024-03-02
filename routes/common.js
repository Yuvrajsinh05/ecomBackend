const FilterSchema = require("../Schema/Filters")
const FashionProducts = require("../Schema/subCategories/Cloths")
const Mobileschema = require("../Schema/subCategories/Mobiles&Accessories")
const computerSchema = require("../Schema/subCategories/Computers&Accessories")
const CategoriesSchema = require('../Schema/Categories')


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

const CreateFashionProduct = async (bodyData, matchType) => {
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
    const options = { new: true, upsert: true }; 
    const newProduct = new FashionProducts({
        name:name,
        price: price,
        image: image,
        description:description,
        category: category,
        subcategory:subcategory,
        type:type,
        SubType:SubType,
        brand:brand
});



    const saved = await newProduct.save();
    if (saved) {
        await FilterSchema.findOneAndUpdate(filter, update, options);
        await CategoriesSchema.findOneAndUpdate({ Categories: "Fashion" }, { $inc: { count: 1 } }, { new: true });
    }
}

const CreateMobileProduct = async (bodyData, matchType) => {
    try {
        const { brand, model, price, screen, camera, battery, memory, storage, weight, description, imageUrl, type, category } = bodyData;
        if (!brand || !model || !price || !screen || !camera || !battery || !memory || !storage || !weight || !description || !imageUrl) {
            const missingFields = [];
            if (!brand) missingFields.push("brand");
            if (!model) missingFields.push("model");
            if (!price) missingFields.push("price");
            if (!screen) missingFields.push("screen");
            if (!camera) missingFields.push("camera");
            if (!battery) missingFields.push("battery");
            if (!memory) missingFields.push("memory");
            if (!storage) missingFields.push("storage");
            if (!weight) missingFields.push("weight");
            if (!description) missingFields.push("description");
            if (!imageUrl) missingFields.push("imageUrl");
            throw { status: 400, message: `The following fields are mandatory: ${missingFields.join(", ")}.` };
        }


        console.log("matchType", matchType, brand)
        if (!matchType?.Brands.includes(brand)) {
            throw { status: 400, message: "We Are Still Limited With Some Brands", PossibleBrands: matchType?.Brands };
        }

        // Define price ranges
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


        const newProduct = new Mobileschema({
            brand: brand,
            model: model,
            price: price,
            screen: screen,
            camera: camera,
            battery: battery,
            memory: memory,
            storage: storage,
            weight: weight,
            description: description,
            imageUrl: imageUrl,
            type: type,
            category: category
        });

        // Save the new product to the database
        const saved = await newProduct.save();
        if (saved) {
            await FilterSchema.findOneAndUpdate(filter, update, options);
        }
    } catch (err) {
        console.log("err", err)
        throw { status: 500, message: "Error Found While Creating Mobile Product", err };
    }
}

const CreateComputerProduct = async (bodyData, matchType) => {
    try {
        const { brand, model, price, processor, memory, storage, graphicsCard, displaySize, weight, description, imageUrl, type, category } = bodyData;
        if (!brand || !model || !price || !processor || !memory || !storage || !graphicsCard || !displaySize || !weight || !description || !imageUrl) {
            const missingFields = [];
            if (!brand) missingFields.push("brand");
            if (!model) missingFields.push("model");
            if (!price) missingFields.push("price");
            if (!processor) missingFields.push("processor");
            if (!memory) missingFields.push("memory");
            if (!storage) missingFields.push("storage");
            if (!graphicsCard) missingFields.push("graphicsCard");
            if (!displaySize) missingFields.push("displaySize");
            if (!weight) missingFields.push("weight");
            if (!description) missingFields.push("description");
            if (!imageUrl) missingFields.push("imageUrl");
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
        const options = { new: true, upsert: true };

        const newProduct = new computerSchema({
            brand: brand,
            model: model,
            price: price,
            processor: processor,
            memory: memory,
            storage: storage,
            graphicsCard: graphicsCard,
            displaySize: displaySize,
            weight: weight,
            description: description,
            imageUrl: imageUrl,
            type: type,
            category: category
        });

        // const savedProduct = await newProduct.save();
        // if (savedProduct) {
            // await FilterSchema.findOneAndUpdate(filter, update, options);
        // }
    } catch (err) {
        console.log("err", err);
        throw { status: 500, message: "Error Found While Creating Computer Product", err };
    }
}



module.exports = { fetchDataObjectsOfTypeRangBrand, shuffleArrayWithUniqueCheck, CreateFashionProduct, CreateMobileProduct ,CreateComputerProduct}