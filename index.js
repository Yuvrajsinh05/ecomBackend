require("dotenv").config();
const express = require('express')
const mongoose = require('mongoose');
require('./config')
const {CategoriesRoutes,ProductsRoutes,AuthUser,customer,PaymentGateway} = require("./routes/router")
const {CategoriesSchema} =require('./Schema/Categories')
const cors = require('cors');
// const bodyParser = require('body-parser');


const app = express()
app.use(express.json())
app.use(cors())




// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "public")));

app.use("/admin",AuthUser);
// app.get('/update-db',(req,res)=>{
//     // Define the new "Range" array
//     const rangeArray = ["100 - 200", "200 - 500", "500 - 1000"];

//     // Iterate through each "SubType" object in the "SubCategories" array
//    let collect  =  db.collection('categories').find({_id:'63ff29e28523a6ee395b8330'})
//    console.log("collect",collect)
//    res.status(200).json({data:collect , message:"send"})
// })


app.get('/update-db', async (req, res) => {
  try {
    // Access the MongoDB collection using Mongoose
    const Category = mongoose.model('categories' , CategoriesSchema); // Replace 'Category' with your actual model name

    // Define the query to find a specific category by _id
    const categoryId = '63ff29e28523a6ee395b8330';

    // Find the category by _id
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // category.SubCategories.forEach((subCategory) => {
      const Rnge = ["100 - 200", "200 - 500", "500 - 1000"];
    // });
    category.SubCategories.forEach((subCategory) => {
      subCategory.SubType.forEach((subType) => {
        subType.Range = Rnge;
      });
    });


    // console.log("Categories",category)
    // Save the updated category
    const savecate = await category.save();
    // console.log("Daveacate",savecate)

    res.status(200).json({ data: category, message: 'Category updated' });
  } catch (error) {
    // console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});






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