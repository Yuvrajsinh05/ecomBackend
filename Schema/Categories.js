const mongoose = require('mongoose')
const CategoriesSchema = new mongoose.Schema({
    Categories:String ,
    SubCategories:Array,
    Products:Array,
    CategoriesId:String,
    count:Number
})
module.exports =  mongoose.model('categories' , CategoriesSchema)