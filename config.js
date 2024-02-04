const mongoose = require('mongoose')
// mongoose.connect(process.env.mongoUrl)/

// console.log("Before mongoose.connect");
mongoose.connect(process.env.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
console.log("After mongoose.connect");


