const nodemailer = require("nodemailer");
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const juice = require('juice');



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
    await transporter.sendMail(mail);
    console.log("Mail Send SuccessFully to" ,to)
    return true;
  } catch (error) {
    console.log('Error from elastic email:' + error);
  }
};


const commonMailFunctionToAll = async (dataToCompile, template) => {
  try {
    let filePath = path.resolve(__dirname, `template/${template}.ejs`);
    let compiled = ejs.compile(fs.readFileSync(filePath, 'utf8'));
    let Subject = dataToCompile.Subject;
    let htmlTemplate = compiled(dataToCompile);
    htmlTemplate = await juice(htmlTemplate);
    try{
     const SendMail = sendMail("ecocoservices@gmail.com", dataToCompile.email, Subject, htmlTemplate, dataToCompile.text || '');
     return SendMail;
    }catch(err){
     console.log("Err",err)
    }
    
  } catch (e) {
    console.log(e);
  }
};



module.exports = { sendMail, commonMailFunctionToAll };
