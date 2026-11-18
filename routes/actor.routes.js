import express from "express"
import mongoose from "mongoose"
import {validateBody} from "../middleware/validateBody.js"
import {actor_sch,actor_update_sch} from "../validation-schemas/actors.js"
import { checkAuth } from "../middleware/checkAuth.js";
import {upload} from "../middleware/upload.js"
import {Actor} from "../models/Actor.js"
import {Movie} from "../models/Movie.js"

export const actorsroutes=express.Router()

actorsroutes.get("/",async(req,res)=>{
    const filter={}
    if(req.query.search){
        const text=req.query.search.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")
        filter.name={$regex:text,$options:"i"}
    }

    const actors=await Actor.find(filter)
    return res.status(200).json({ "data": actors })
})

actorsroutes.get("/:id",async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).json({ "error": "actor not found" })
    }

    const actor=await Actor.findById(req.params.id).populate("movies","title year image")
    if(!actor){
        return res.status(404).json({ "error": "actor not found" })
    }

    return res.status(200).json({ "data": actor })
})

actorsroutes.post("/",checkAuth,upload.array("images",5),validateBody(actor_sch),async(req,res)=>{
    const actor=await Actor.create({
        name:req.body.name,
        birthdate:req.body.birthdate,
        images:req.files ? req.files.map(f=>f.filename) : []
    })

    return res.status(201).json({
        "message": "actor created successfully",
        "data": actor
    })
})

actorsroutes.patch("/:id",checkAuth,upload.array("images",5),validateBody(actor_update_sch),async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).json({ "error": "actor not found" })
    }

    const update={}
    if(req.body.name!==undefined) update.name=req.body.name
    if(req.body.birthdate!==undefined) update.birthdate=req.body.birthdate
    //new images replace the old ones
    if(req.files && req.files.length>0) update.images=req.files.map(f=>f.filename)

    const actor=await Actor.findByIdAndUpdate(req.params.id,update,{new:true})
    if(!actor){
        return res.status(404).json({ "error": "actor not found" })
    }

    return res.status(200).json({
        "message": "actor updated successfully",
        "data": actor
    })
})

actorsroutes.delete("/:id",checkAuth,async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).json({ "error": "actor not found" })
    }

    const actor=await Actor.findByIdAndDelete(req.params.id)
    if(!actor){
        return res.status(404).json({ "error": "actor not found" })
    }

    //remove the actor from all movies
    await Movie.updateMany({actors:actor._id},{$pull:{actors:actor._id}})

    return res.status(200).json({ "message": "actor deleted successfully" })
})