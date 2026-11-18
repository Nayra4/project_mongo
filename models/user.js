import mongoose from "mongoose";



const userSchema = new mongoose.Schema({
    username:{type: String, required: true, minLength:2 },
    email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,},
    password:{type:String ,required:true},
    image:{type:String },
    resetOtp:{type:String },
    resetOtpExpires:{type:Date}
})

export const User = mongoose.model("User", userSchema);
