const jwt = require('jsonwebtoken')
const UserSchema = require("../Schema/User")


async function verifyToken(req, res, next) {
    console.log("Calling" ,req.path)    
   
    if (req.path === '/admin/login'
   || req.path === '/admin/register' 
   || req.path === '/admin/isVerifiedRegister' 
   || req.path==='/admin/isGoogleLogin' 
   || req.path==='/admin/isGithubLogin'
   || req.path==='/admin/isGitcallback'
   ) {
      return next();
    }
    
    let token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
  
    // Verify the JWT
    jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN,async function (err, decoded) {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      req.customer = decoded;
      const IsUserStillExist = await UserSchema.find({_id:decoded.userID})
      if(!IsUserStillExist[0]){
        return res.status(500).json({message:"Your Id Has Been Deleted!!"})
      }
      return next();
    });
  }


  
  module.exports = {verifyToken};

  
  