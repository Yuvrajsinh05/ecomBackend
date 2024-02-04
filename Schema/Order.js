const { default: mongoose } = require("mongoose");



const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
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
        enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled'],
        default: 'pending',
    },
    shipping_address: {
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
    ]
})

module.exports = mongoose.model('Orders', OrderSchema)


