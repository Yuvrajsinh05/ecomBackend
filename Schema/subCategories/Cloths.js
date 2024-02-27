const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    type:{type:String , required:true},
    SubType:{type:String , required:true},
    Brands:{type:Array , required:true},
    brand:{type:String }
  });
const FashionProducts = mongoose.model('Fashion', ProductSchema);

module.exports = FashionProducts;






// check category if match then ====>  passs to subcategory if match  ==> pass to type if Pass==>SubType then =>type  => BRands then  => check range and update show is it in ecom default