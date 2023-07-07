const mongoose = require('mongoose');

const mobileSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  price: { type: Number, required: true },
  screen: { type: String, required: true },
  camera: { type: String, required: true },
  battery: { type: String, required: true },
  memory: { type: String },
  storage: { type: String },
  weight: { type: Number },
  description: { type: String },
  imageUrl: { type: String },
  type:{type : String},
  category:{type:String}
});

const Mobile = mongoose.model('Mobile', mobileSchema);

module.exports = Mobile;
