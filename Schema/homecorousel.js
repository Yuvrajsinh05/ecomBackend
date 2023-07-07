const mongoose = require("mongoose");
const HomeCorouselSchema = new mongoose.Schema({
    imageUrl:String,
    description:String,
    category:String
      
})

module.exports = mongoose.model('homecorousels',HomeCorouselSchema)
