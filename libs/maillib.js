const nodemailer = require("nodemailer");
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.email,
    pass: process.env.password,
  },
});

// rest of the email sending code, including message configuration and transporter.sendMail()


const sendMail = async (from, to, subject, template, text, attachments = []) => {
  let mail = {
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text,
    html: template,
    attachments
  };
  try {
    let info = await transporter.sendMail(mail);
    return true;
  } catch (error) {
    console.log('Error from elastic email:' + error);
  }
};


const commonMailFunctionToAll = (dataToCompile, template) => {
  try {
    let filePath = path.resolve(__dirname + `/template/${template}.ejs`)
    let compiled = ejs.compile(fs.readFileSync(filePath, 'utf8'))
    let  Subject = dataToCompile.Subject;
    return sendMail("yuvrajsinh0005@gmail.com", dataToCompile.email, Subject, compiled(dataToCompile), dataToCompile.text || '');
  } catch (e) {
    // logger.error(e);
    console.log(e);
  }
};


module.exports = { sendMail, commonMailFunctionToAll };
