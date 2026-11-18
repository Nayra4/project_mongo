import {Session} from "../models/Session.js"

export const checkAuth=async(req,res,next)=>{

    const sessionId =req.cookies.movie_session
    if(!sessionId){
        return res.status(401).json({
    "error": "invalid session"
})
    }
    try{
        const session = await Session.findOne({sessionId:sessionId}).populate("user")
        if(!session || !session.user){
            return res.status(401).json({
    "error": "invalid session"
})
        }
        req.user= session.user
        return next()
        }
        catch{
            return res.status(401).json( {
    "error": "invalid session"
})
        }
}