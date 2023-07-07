require("dotenv").config();
const express = require('express')
require('./config')
const {CategoriesRoutes,ProductsRoutes,AuthUser,customer,PaymentGateway} = require("./routes/router")
const cors = require('cors');
// const bodyParser = require('body-parser');


const app = express()
app.use(express.json())
app.use(cors())



// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "public")));

app.use("/admin",AuthUser);



app.use("/admin",CategoriesRoutes);
app.use("/admin",PaymentGateway);
app.use("/admin",ProductsRoutes);
app.use("/admin",customer);












// app.put('/updatemore',async(req,res)=>{
//   try{
//    let datacol = await computerSchema.updateMany({
//       $set:{category:"Electronics"}
//     })
//    res.status(200).json({data: datacol ,message:"updated filesss"})
//   }catch(Err){
//     res.status(400).json({message:"error catched"})
//   }
// })

app.listen(8670, () => {
  console.log("server is runiing on.", `${8670}`)
})