import express from "express"
import {validateBody} from "../middleware/validateBody.js"
import crypto from "crypto";
import {register_sch,login_shc,forgot_sch,reset_sch} from "../validation-schemas/auth.schema.js"
import bcrypt from "bcrypt"
import { checkAuth } from "../middleware/checkAuth.js";
import {upload} from "../middleware/upload.js"
import {User} from "../models/user.js"
import {Session} from "../models/Session.js"


export const authroutes=express.Router()

authroutes.post("/register",upload.single("image"),validateBody(register_sch),async(req,res)=>{
//check if email in use 
    const data =await User.findOne({email:req.body.email.toLowerCase()})
    if(data){
    return res.status(422).json({
        
    "errors": {
        "email": {
        "errors": ["email already in use"]
        },
        "password": {
        "errors": ["password must contain at least 1 capital letter, 1 small letter, 1 digit, and 1 special character"]
        }
    }
})
    }

//hash the password 
const password_hash=await bcrypt.hash(req.body.password,10)
//insert the user 
const user =await User.create({
    username:req.body.username,
    email:req.body.email.toLowerCase(),
    password:password_hash,
    image:req.file ? req.file.filename : null
})
return res.status(201).json({
    "message": "register successful, you can now login",
    "data": {
        "user": {
        "_id": user._id,
        "username": user.username,
        "email": user.email,
        "image": user.image,
        "createdAt": user.createdAt,
        "updatedAt": user.updatedAt
        }
    }
})

})

authroutes.post("/login",validateBody(login_shc),async(req,res)=>{

    //check if password and email is in database
    const data =await User.findOne({email:req.body.email.toLowerCase()})
    if(!data){
        return res.status(401).json({ "error": "invalid email or password" })
    }

    const valid=await bcrypt.compare(req.body.password,data.password)
    if(!valid){
        return res.status(401).json({ "error": "invalid email or password" })
    }

//create the session
const session = await Session.create({
    user:  data._id
});

res.cookie("movie_session", session.sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

    return res.status(200).json({
    "message": "login successful",
    "data": {
        "user":{
        "_id": data._id,
        "username": data.username,
        "email": data.email,
        "image": data.image,
        "createdAt": data.createdAt,
        "updatedAt": data.updatedAt
    }
    }
})
})

authroutes.post("/logout", async (req, res) => {
    const sessionId = req.cookies.movie_session;

    if (sessionId) {
        try {
        await Session.deleteOne({sessionId:sessionId});
        } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "server error" });
        }
    }

    res.clearCookie("movie_session", {
        httpOnly: true,
        sameSite: "lax",
    });

    res.status(200).json({ "message": "logout successful" });
});

authroutes.post("/forgot-password",validateBody(forgot_sch),async(req,res)=>{
    //check if the email exists
    const data =await User.findOne({email:req.body.email.toLowerCase()})
    if(!data){
        return res.status(404).json({ "error": "user with this email does not exist" })
    }

    //generate 6 digit otp that expires after 15 minutes
    const otp = crypto.randomInt(100000,1000000).toString()
    data.resetOtp = otp
    data.resetOtpExpires = new Date(Date.now() + 15*60*1000)
    await data.save()

    return res.status(200).json({
        "message": "otp generated successfully",
        "otp": otp
    })
})

authroutes.post("/reset-password",validateBody(reset_sch),async(req,res)=>{
    const data =await User.findOne({email:req.body.email.toLowerCase()})

    //check the otp and its expiry date
    if(!data || data.resetOtp !== req.body.otp || data.resetOtpExpires < new Date()){
        return res.status(400).json({ "error": "invalid or expired otp" })
    }

    //hash the new password and clear the otp
    data.password = await bcrypt.hash(req.body.new_password,10)
    data.resetOtp = undefined
    data.resetOtpExpires = undefined
    await data.save()

    return res.status(200).json({
        "message": "password reset successful, you can now login"
    })
})

authroutes.get("/me", checkAuth, (req, res) => {

    return res.status(200).json({
        data: {
            user: {
                _id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                image: req.user.image,
                createdAt: req.user.createdAt,
                updatedAt: req.user.updatedAt
            }
        }
    });
});