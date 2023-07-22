const router = require('express').Router()
const { isEmpty, trim, isEmail, isStrong } = require('../libs/checkLib')
const otpGenerator = require('otp-generator')
const Counters = require('../Schema/Counters')
const UserSchema = require('../Schema/User')
const hashpassword = require('../libs/passwordLib').hashpassword
const comparePasswordSync = require('../libs/passwordLib').comparePasswordSync
const jwt = require('jsonwebtoken')
const commonMailFunctionToAll = require('../libs/maillib').commonMailFunctionToAll



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
      return res.status(400).json({ message: "email already exists" })
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
      (err, admin) => {
        console.log("admin", admin)
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
            first_name: `Dear ${admin.user} Yuvrajsinh hope you are doing well`,
            email: admin.email
          };


          commonMailFunctionToAll(data, "loginsuccess");

          return res.status(200).json({
            success: true,
            message: "Authentication successful!",
            token: token,
            role: admin.type,
            user: {
              name: admin.Name,
              email: admin.email,
              _id: admin._id
            },
          });
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


const isVerifiedRegister = async (req, res) => {
  const { email, clientOtp, password, repassword } = req.body;

  if (!email) {
    return res.status(400).json({ message: "email missing" });
  }

  if (!clientOtp) {
    return res.status(400).json({ message: "clientOtp missing" });
  }

  if (!password) {
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


// router.get('/api/validateToken', (req, res) => {
//   const token = req.headers.authorization.split(' ')[1];
//   try {
//     const decodedToken = jwt.verify(token, secret);
//     res.sendStatus(200);
//   } catch (err) {
//     res.sendStatus(401);
//   }
// });

router.post("/login", Login)
router.post("/register", register)
router.post("/isVerifiedRegister", isVerifiedRegister)



module.exports = router;