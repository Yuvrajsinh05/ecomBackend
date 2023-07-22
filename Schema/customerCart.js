const { default: mongoose } = require("mongoose");

const customerCartSchema = new mongoose.Schema(
    {
        customer_id: {
            type: String,
            required: true
          },
        items: [
          {
            product_id: {
                type: String,
                required: true
              },
            product_name : {
              type:String
            },
            quantity:{
                type: Number,
                required: true
              },
            price: {
                type: Number,
                required: true
              }
          }
        ],
    } ,
    {
        timestamps: true
    }
)


module.exports = mongoose.model('customercart' , customerCartSchema)