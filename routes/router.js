const CategoriesRoutes = require("./categories")
const ProductsRoutes = require("./products")
const AuthUser = require("./authuser")
const customer = require("./customer")
const PaymentGateway = require('./razor')
const ChatBotSocket = require('./chatbot')


module.exports= {
    CategoriesRoutes,
    ProductsRoutes,
    AuthUser,
    customer,
    PaymentGateway,
    ChatBotSocket
}