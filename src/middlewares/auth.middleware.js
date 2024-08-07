import jwt from "jsonwebtoken"
import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";

export const verifyJWt=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new apiError(401,"Unauthorized request")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user=User.findById(decodedToken?._id).select("-password -refreshToken")
            if(!user){
                throw new apiError(401,"invalid access token")
            }
    }
    catch(error){
        throw new apiError(401,error?.message||"invalid access token-")
    }
})