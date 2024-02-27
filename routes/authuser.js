const router = require('express').Router()
const { isEmpty, trim, isEmail, isStrong } = require('../libs/checkLib')
const UserSchema = require('../Schema/User')
const hashpassword = require('../libs/passwordLib').hashpassword
const comparePasswordSync = require('../libs/passwordLib').comparePasswordSync
const jwt = require('jsonwebtoken')
const commonMailFunctionToAll = require('../libs/maillib').commonMailFunctionToAll
const passport = require('passport');
const querystring = require('querystring');
const axios = require('axios')
const customerCartSchema = require('../Schema/customerCart')

// Passport initialization
router.use(passport.initialize());

const register = async (req, res) => {

  const { Name, email, phone } = req.body
  if (!trim(Name) || !trim(email) || !trim(phone)) {
    return res.status(400).json({ message: "fine!!!  provide your Name , email , phone" })
  }

  const UserName = trim(req?.body?.Name);
  const UserEmail = trim(req?.body?.email).toLowerCase();
  // let UserPassword = trim(req?.body?.password);


  const OTP = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
  if (!isEmail(UserEmail)) {
    return res.status(404).json({
      message: "InValid Email",
    });
  }
  // if (!isStrong(UserPassword)) {
  //   return res.status(404).json({
  //     message: "Password is not Strong Enough",
  //   });
  // }
  try {
    // if (userOTP == OTP) {
    let data = {
      Sno: 99, //admins + 1,
      Name: UserName,
      email: UserEmail,
      otp: OTP,
      phone: phone
      // password: hashpassword(UserPassword),
    }
    const createUser = new UserSchema(data)
    //send activation mail here
    const mailUserReg = {
      Subject: "Registration successFull",
      first_name: `Dear ${UserName} hope you are doing well!`,
      email: UserEmail,
      userOTP: OTP,
      Name: UserName,
      PhoneNum: phone
    };


    const Findhim = await UserSchema.findOne({ email: UserEmail })
    if (Findhim) {
      return res.status(500).json({ status:500 ,  message: "email already exists" })
    }
    commonMailFunctionToAll(mailUserReg, "register");
    try {
      const response = await createUser.save()
      res.status(200).json({ message: "Admin Registration successfull", data: response });
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  } catch (error) {
    res.status(500).json({
      message: "Try again later !!!",
    });
  }
};

const isVerifiedRegister = async (req, res) => {
  const { email, clientOtp, password, repassword } = req.body;

  if (!trim(email)) {
    return res.status(400).json({ message: "email missing" });
  }

  if (!trim(clientOtp)) {
    return res.status(400).json({ message: "clientOtp missing" });
  }

  if (!trim(password)) {
    return res.status(400).json({ message: "password missing" });
  }

  if (password !== repassword) {
    return res.status(400).json({ message: "passwords not matching" });
  }

  if (!isStrong(password)) {
    return res.status(400).json({ message: "Password is not strong enough" });
  }

  try {
    const user = await UserSchema.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp != clientOtp) {
      return res.status(400).json({ message: "OTP doesn't match" });
    }

    const updatedUser = await UserSchema.updateOne(
      { email: email },
      { $set: { password: hashpassword(password) } }
    );

    return res.status(200).json({ message: "Created successfully", data: updatedUser });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "An error occurred, please try again" });
  }
};

const Login = (req, res) => {
  if (isEmpty(req.body.username) || isEmpty(req.body.password)) {
    return res.json({
      success: false,
      message: "Credentials missing",
    });
  } else {
    let username = trim(req.body.username.toString().toLowerCase());
    let password = trim(req.body.password);
    UserSchema.findOne(
      { email: username, isVerified: true, isActive: true, isPublished: true },
      async (err, admin) => {
        if (admin && comparePasswordSync(password, admin?.password)) {
          const token = jwt.sign(
            { userID: admin._id, type: admin.type },
            process.env.JWT_SECRET_ACCESS_TOKEN,
            {
              expiresIn: "24h", // expires in 24 hours
            }
          );
          // send email
          const data = {
            Subject: "Login SuccessFully",
            name: username,
            first_name: "Dear Yuvrajsinh hope you are doing well!",
            email: "yuvrajsinh73598@gmail.com"
          };
          commonMailFunctionToAll(data, "loginsuccess");

          try {
            // Retrieve data from customerCartSchema based on userID
            let getUserCarts = await customerCartSchema.find({ customer_id: admin._id });
            
            return res.status(200).json({
              success: true,
              message: "Authentication successful!",
              token: token,
              role: admin.type,
              Userdata: admin,
              CartItems :getUserCarts[0]?.items // Include user carts data in the response
            });
          } catch (error) {
            console.error("Error retrieving user carts:", error);
            return res.status(500).json({ message: "Internal server error" });
          }
        } else {
          return res.status(401).json({
            success: false,
            message: "Invalid Credentials",
          });
        }
      }
    );
  }
};

const isGoogleLogin = async (req, res) => {
  const { email, email_verified, name, picture, sub } = req.body;

  try {
    if(!email_verified){
      return res.status(400).json({message:"email is not verified by Google!"})
    }
    let userfound = await UserSchema.findOne({ email: email });
    let newUser = false;

    if (!userfound) {
      let dataRegister = {
        Sno: sub,
        email: email,
        Name: name,
        Image: picture,
        isVerified: email_verified,
      };

      const loguser = new UserSchema(dataRegister);
      userfound = await loguser.save();
      newUser = true;
    }

    const token = jwt.sign(
      { userID: userfound._id, type: newUser ? "IsgoogleUser" : userfound.type },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      {
        expiresIn: "24h", // expires in 24 hours
      }
    );
    const data = {
      Subject: "Login Successfully",
      name: userfound.Name,
      first_name: `Dear ${userfound.Name}, hope you are doing well!`,
      email: userfound.email,
  
    };
    let getUserCarts = await customerCartSchema.find({ customer_id: userfound?._id });
            

    commonMailFunctionToAll(data, "loginsuccess");
    return res.status(200).json({
      status: 200,
      message: "Authentication successful!",
      token: token,
      role: userfound.type,
      Userdata: userfound,
      CartItems :getUserCarts[0]?.items 
    });
  } catch (err) {
    // Handle errors here

    if (err.name === 'MongoError' && err.code === 11000) {
      // Duplicate key error (email already exists)
      return res.status(400).json({
        status: 400,
        message: "Google internal login issues, please log in with credentials.",
      });
    } else {
      // Generic server error
      console.error(err);
      return res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    }
  }
};

const isGitcallback = async (req, res) => {
  try {
    const { code } = req.query;

    // Exchange the GitHub code for an access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: {
        Accept: 'application/json',
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // Get user details using the access token
    const userDetailsResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    // Extract required user details
    const { avatar_url, name, email } = userDetailsResponse.data;

    // Check if the email is verified
    if (!email) {
      return res.status(400).json({ message: "Email not found in GitHub profile." });
    }
    if (!name) {
      return res.status(400).json({ message: "Name not found in GitHub profile." });
    }
    const data = {
      Subject: "Login Successfully",
      name: name,
      first_name: `Dear ${name}, hope you are doing well!`,
      email: email,
  
    };

    commonMailFunctionToAll(data, "loginsuccess");

    // You can add additional checks for email verification if required
    // For example, check if the email is verified by GitHub

    // Proceed with your user registration logic similar to isGoogleLogin
    let userfound = await UserSchema.findOne({ email });

    if (!userfound) {
      // User not found, create a new user
      const dataRegister = {
        // Adjust fields as needed based on your schema
        email,
        Name: name,
        Image: avatar_url,
        isVerified: true, // GitHub doesn't provide email verification status, assume it's true
      };

      const loguser = new UserSchema(dataRegister);
      userfound = await loguser.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userID: userfound._id, type: "IsgithubUser" },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      {
        expiresIn: "24h", // expires in 24 hours
      }
    );

    // Respond with authentication successful
    return res.redirect(`http://localhost:3000/?token=${token}&name=${userfound.Name}&email=${userfound.email}&_id=${userfound._id}&savedProducts=${userfound?.savedProducts}`);

  } catch (err) {
    console.error("Error occurred during GitHub callback:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

const isGithubLogin = async (req, res) => {
  try {
    const params = {
      client_id: process.env.GITHUB_CLIENT_ID
    };
    const queryString = querystring.stringify(params);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?${queryString}`;
    res.status(200).json({reDirect :githubAuthUrl})
    // res.redirect(githubAuthUrl);
  } catch (err) {
    console.log("GitLoginErr", err);
  }
}

const UserDetails = async (req, res) => {
  try {
    const { userID } = req.customer;
    let fetchUserDetails = await UserSchema.findById(userID);
    if (!fetchUserDetails) {
      return res.status(404).json({ message: "User not found" });
    }
    let getUserCarts = await customerCartSchema.find({ customer_id: userID });

    res.status(200).json({ Userdata: fetchUserDetails , CartItems :getUserCarts[0]?.items, message: "Details Found" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err, message: "Internal Server Error" });
  }
};




router.post("/login", Login)
router.post("/register", register)
router.post("/isVerifiedRegister", isVerifiedRegister)
router.post("/isGoogleLogin", isGoogleLogin)
router.get("/isGithubLogin", isGithubLogin)
router.get("/isGitcallback", isGitcallback)
router.get("/userDetails", UserDetails)



module.exports = router;