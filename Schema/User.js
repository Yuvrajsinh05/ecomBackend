const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
    {
        Sno: Number,
        Name: { type: String, required: true, default: "" },
        designation: { type: String, default: "" },
        phone: { type: String, required: true, default: "" },
        email: {
            type: String,
            unique: true,
            required: true,
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
