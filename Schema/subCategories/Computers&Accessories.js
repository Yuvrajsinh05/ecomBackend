const mongoose =require('mongoose')

const computerSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  price: { type: Number, required: true },
  processor: { type: String, required: true },
  memory: { type: String, required: true },
  storage: { type: String, required: true },
  graphicsCard: { type: String },
  displaySize: { type: String },
  weight: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  type:{type : String},
  category:{type:String}
});

const Computer = mongoose.model('computer&accesserioes', computerSchema);

module.exports = Computer;


// check category if match then ====>  passs to type if match  ==> pass to Brand if Pass => check range and update show is it in ecom default