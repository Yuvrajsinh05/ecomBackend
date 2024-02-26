const mongoose = require("mongoose");
const Schema = mongoose.Schema;



// if Prodtype = 'Mobiles&Accessories'  takeModal = 'Mobile'
// if Prodtype = 'Computers&Accessories'  takeModal = 'computer&accesserioes'
// else  takeModal = 'Fashion'

const customerCartSchema = new Schema(
  {
    customer_id: {
      type: String,
      required: true
    },
    items: [
      {
        product_id: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        product_name: {
          type: String
        },
        Prodcategory: {
          type: String
        },
        Prodtype: {
          type: String
        },
        quantity: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);



module.exports = mongoose.model('customercart' , customerCartSchema)
