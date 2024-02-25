const express = require('express')
require("dotenv").config();
require('./config')
const {CategoriesRoutes,ProductsRoutes,AuthUser,customer,PaymentGateway} = require("./routes/router")
const cors = require('cors');
const {verifyToken } = require('./middlewares/security')
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express()
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });


app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json())
app.use(cors())
app.use(verifyToken)

app.use("/admin",AuthUser);
app.use("/admin",CategoriesRoutes);
app.use("/admin",PaymentGateway);
app.use("/admin",ProductsRoutes);
app.use("/admin",customer);

app.listen(8670, () => {
  console.log("server is runiing on.", `${8670}`)
})