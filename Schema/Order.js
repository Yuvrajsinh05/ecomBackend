const { default: mongoose } = require("mongoose");



const OrderSchema = new mongoose.Schema({
    razorOrderId: {
        type: String,
        required: true,
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId, // Assuming customer ID is an ObjectId
        ref: 'Customer', // Reference to the Customer model
        required: true,
    },
    date: {
        type: String
    },
    total_price: {
        type: String
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'accepted', 'shipped', 'delivered', 'canceled'],
        default: 'pending',
    },
    paymentStatus : {
        type:String,
        enum:['pending', 'completed', 'failed']
    },
    items: [
        {
            product_id: {
                type: String
            },
            quantity: {
                type: String
            },
            price: {
                type: String
            }
        }
    ],
    billingDetails: {
        fName: {
            type: String,
            required: true
        },
        lName: {
            type: String,
            required: true
        },
        email:{
            type:String,
            required:true
        },
        ContactNo:{
            type:String,
            required:true
        },

        address:{
            street: {
                type: String
            },
            city: {
                type: String
            },
            state: {
                type: String
            },
            zipcode: {
                type: String
            },
            country: {
                type: String
            }
        }
   
    },
})

module.exports = mongoose.model('Orders', OrderSchema)
