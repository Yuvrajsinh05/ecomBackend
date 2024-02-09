const jwt = require('jsonwebtoken')

// Define the middleware function
function verifyToken(req, res, next) {

    console.log("Calling" ,req.path)
    // Get the JWT from the Authorization header
    if (req.path === '/admin/login' || req.path === '/admin/register' || req.path === '/admin/isVerifiedRegister' || req.path==='/admin/isGoogleLogin') {
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
  
      // Attach the decoded payload to the request object and proceed to the next middleware
      req.user = decoded;
      return next();
    });
  }
  
  module.exports = verifyToken;

  
  