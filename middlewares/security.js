const jwt = require('jsonwebtoken')
const UserSchema = require("../Schema/User")


function verifyToken(req, res, next) {
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
    jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN, function (err, decoded) {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      req.customer = decoded;

      return next();
    });
  }


  
  module.exports = {verifyToken};

  
  