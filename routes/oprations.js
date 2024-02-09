// Update route
router.get('/deleteFashionBrands', async (req, res) => {
    try {
      // Use updateMany to unset the Brands key
     let updated = await FashionProducts.updateMany({}, { $unset: { "Brands": "" } });
  
      res.json({data:updated, message: "Brands key deleted from all documents" });
    } catch (error) {
      console.error("Error updating documents:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  
  router.get('/updateFashionBrands', async (req, res) => {
    try {
      // let fashionData = await FashionProducts.find().lean(); // Use lean() to convert Mongoose document to plain JavaScript object
     let fashionData =  await FashionProducts.updateMany({}, { $unset: { "Brands": "" } }); // Use lean() to convert Mongoose document to plain JavaScript object
      // Process fashionData here if needed
      let WomentsBrands = [
        "Victoria's Secret",
        "H&M",
        "Forever 21",
        "Zara"
      ]
  
      let MensBrands = [
        "Nike",
        "Adidas",
        "Levi's",
        "Ralph Lauren"
      ]
  
      let Jewelry =   [
        "Tiffany & Co.",
        "Pandora",
        "Swarovski",
        "Kate Spade"
      ]
  
      let childshoes = [
        "Stride Rite",
        "Skechers Kids",
        "Nike Kids",
        "Crocs Kids"
      ]
      let MenSHoes = [
        "Nike",
        "Adidas",
        "New Balance",
        "Timberland"
      ]
  
      let childClothing = [
        "GAP Kids",
        "Carters",
        "OshKosh B'gosh",
        "The Children's Place"
      ]
  
      let Sunglasses = [
        "Ray-Ban",
        "Oakley",
        "Prada",
        "Gucci"
      ]
      // fashionData.forEach((data) => {
      //   if (data?.type === "Men's Clothing") {
      //     const randomIndex = Math.floor(Math.random() * MensBrands.length);
      //     const randomBrand = MensBrands[randomIndex];
      //     data.brand = randomBrand;
      //   }else if(data?.type==="Women's Clothing"){
      //     const randomIndex = Math.floor(Math.random() * WomentsBrands.length);
      //     const randomBrand = WomentsBrands[randomIndex];
      //     data.brand = randomBrand;
      //   } else if(data?.type==="Jewelry"){
      //     const randomIndex = Math.floor(Math.random() * Jewelry.length);
      //     const randomBrand = Jewelry[randomIndex];
      //     data.brand = randomBrand;
      //   } else if(data?.type==="Children's Shoes"){
      //     const randomIndex = Math.floor(Math.random() * childshoes.length);
      //     const randomBrand = childshoes[randomIndex];
      //     data.brand = randomBrand;
      //   } else if(data?.type==="Men's Shoes"){
      //     const randomIndex = Math.floor(Math.random() * MenSHoes.length);
      //     const randomBrand = MenSHoes[randomIndex];
      //     data.brand = randomBrand;
      //   } else if(data?.type==="Children's Clothing"){
      //     const randomIndex = Math.floor(Math.random() * childClothing.length);
      //     const randomBrand = childClothing[randomIndex];
      //     data.brand = randomBrand;
      //   } else if(data?.type==="Sunglasses"){
      //     const randomIndex = Math.floor(Math.random() * Sunglasses.length);
      //     const randomBrand = Sunglasses[randomIndex];
      //     data.brand = randomBrand;
      //   }
      //   delete data.Brands;
      // });
      
  
         // Update the documents in the database
        //  for (const data of fashionData) {
        //   await FashionProducts.findByIdAndUpdate(data._id, { $set: data }, { new: true });
        // }
    
        // res.status(200).json({ message: 'Fashion data updated successfully' });
  
  
  
  
      return res.status(200).json({ data: fashionData, message: "All good, champ!" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  