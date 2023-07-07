const CategoriesRoutes = require("./categories")
const ProductsRoutes = require("./products")
const AuthUser = require("./authuser")
const customer = require("./customer")
const PaymentGateway = require('./razor')


module.exports= {
    CategoriesRoutes,
    ProductsRoutes,
    AuthUser,
    customer,
    PaymentGateway
}