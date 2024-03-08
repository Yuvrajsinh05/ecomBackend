const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
    {
        Name: { type: String, required: true, default: "" },
        Image: { type: String, default: "" },
        savedProducts: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Cloths',
            },
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Mobiles&Accessories', 
            },
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Computers&Accessories', 
            },
          ],
        designation: { type: String, default: "user" },
        phone: { type: String, default: "" },
        email: {
            type: String,
            unique: true,
            required: true,
            default:""
        },
        password: {
            type: String,
            default: "",
        },
        otp: { type: String, default: "", expires: 120 },
        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: true,
        },
        createdAt: { type: Date, default: Date.now} 
    }
)



module.exports = mongoose.model('customers', UserSchema);
