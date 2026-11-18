import express from "express"
import mongoose from "mongoose"
import {validateBody} from "../middleware/validateBody.js"
import {review_sch,review_update_sch} from "../validation-schemas/reviews.js"
import { checkAuth } from "../middleware/checkAuth.js";
import {Review} from "../models/Review.js"
import {Movie} from "../models/Movie.js"

export const reviewsroutes=express.Router()

reviewsroutes.get("/my",checkAuth,async(req,res)=>{
    const reviews=await Review.find({user:req.user._id}).populate("movie","title year image")
    return res.status(200).json({ "data": reviews })
})

reviewsroutes.post("/:movieId",checkAuth,validateBody(review_sch),async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.movieId)){
        return res.status(404).json({ "error": "movie not found" })
    }

    const movie=await Movie.findById(req.params.movieId)
    if(!movie){
        return res.status(404).json({ "error": "movie not found" })
    }

    const review=await Review.create({
        number:req.body.number,
        comment:req.body.comment,
        movie:movie._id,
        user:req.user._id
    })

    return res.status(201).json({
        "message": "review added successfully",
        "data": review
    })
})

reviewsroutes.patch("/:id",checkAuth,validateBody(review_update_sch),async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).json({ "error": "review not found" })
    }

    const review=await Review.findById(req.params.id)
    if(!review){
        return res.status(404).json({ "error": "review not found" })
    }

    //only the author can update
    if(review.user.toString()!==req.user._id.toString()){
        return res.status(403).json({ "error": "you are not authorized to update this review" })
    }

    if(req.body.number!==undefined) review.number=req.body.number
    if(req.body.comment!==undefined) review.comment=req.body.comment
    await review.save()

    return res.status(200).json({
        "message": "review updated successfully",
        "data": review
    })
})

reviewsroutes.delete("/:id",checkAuth,async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).json({ "error": "review not found" })
    }

    const review=await Review.findById(req.params.id)
    if(!review){
        return res.status(404).json({ "error": "review not found" })
    }

    if(review.user.toString()!==req.user._id.toString()){
        return res.status(403).json({ "error": "you are not authorized to delete this review" })
    }

    await review.deleteOne()

    return res.status(200).json({ "message": "review deleted successfully" })
})