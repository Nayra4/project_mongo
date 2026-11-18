import express from "express"
import mongoose from "mongoose"
import {validateBody} from "../middleware/validateBody.js"
import {movie_sch,movie_update_sch,review_sch} from "../validation-schemas/movies.js"
import { checkAuth } from "../middleware/checkAuth.js";
import {upload} from "../middleware/upload.js"
import {Movie} from "../models/Movie.js"
import {Review} from "../models/Review.js"

export const moviesroutes=express.Router()


const toGenres=(genres)=>{
    if(Array.isArray(genres)) return genres
    return genres.split(",").map(g=>g.trim()).filter(g=>g)
}


const toActors=(actors)=>{
    if(Array.isArray(actors)) return actors
    return JSON.parse(actors)
}

moviesroutes.get("/",async(req,res)=>{
    const filter={}
    if(req.query.search){
        const text=req.query.search.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")
        filter.title={$regex:text,$options:"i"}
    }
    if(req.query.actor){
        filter.actors=req.query.actor
    }

    const movies=await Movie.find(filter).populate("actors","name images birthdate")
    return res.status(200).json({ "data": movies })
})

moviesroutes.get("/:id",async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).json({ "error": "invalid id" })
    }

    const movie=await Movie.findById(req.params.id)
        .populate("actors","name images birthdate")
        .populate({path:"reviews",populate:{path:"user",select:"username image"}})
    if(!movie){
        return res.status(404).json({ "error": "movie not found" })
    }

    return res.status(200).json({ "data": movie })
})

moviesroutes.post("/",checkAuth,upload.single("image"),validateBody(movie_sch),async(req,res)=>{
    const movie=await Movie.create({
        title:req.body.title,
        year:req.body.year,
        genres:toGenres(req.body.genres),
        description:req.body.description,
        trailerLink:req.body.trailerLink,
        director:req.body.director,
        actors:req.body.actors ? toActors(req.body.actors) : [],
        image:req.file ? req.file.filename : null
    })

    return res.status(201).json({
        "message": "movie created successfully",
        "data": movie
    })
})

moviesroutes.patch("/:id",checkAuth,upload.single("image"),validateBody(movie_update_sch),async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).json({ "error": "movie not found" })
    }

    const update={}
    const fields=["title","year","description","trailerLink","director"]
    fields.forEach(f=>{
        if(req.body[f]!==undefined) update[f]=req.body[f]
    })
    if(req.body.genres!==undefined) update.genres=toGenres(req.body.genres)
    if(req.body.actors!==undefined) update.actors=toActors(req.body.actors)
    if(req.file) update.image=req.file.filename

    const movie=await Movie.findByIdAndUpdate(req.params.id,update,{new:true,runValidators:true})
    if(!movie){
        return res.status(404).json({ "error": "movie not found" })
    }

    return res.status(200).json({
        "message": "movie updated successfully",
        "data": movie
    })
})

moviesroutes.delete("/:id",checkAuth,async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).json({ "error": "movie not found" })
    }

    const movie=await Movie.findByIdAndDelete(req.params.id)
    if(!movie){
        return res.status(404).json({ "error": "movie not found" })
    }

    await Review.deleteMany({movie:movie._id})

    return res.status(200).json({ "message": "movie deleted successfully" })
})

moviesroutes.post("/:id/reviews",checkAuth,validateBody(review_sch),async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).json({ "error": "movie not found" })
    }

    const movie=await Movie.findById(req.params.id)
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