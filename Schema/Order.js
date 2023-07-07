const { default: mongoose } = require("mongoose");



const OrderSchema = new mongoose.Schema({
    customer_id: {
        type: String
    },
    date: {
        type: String
    },
    total_price: {
        type: String
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

module.exports = mongoose.model('Orders' , OrderSchema)