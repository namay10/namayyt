import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from "../utils/apiError.js"
import { User } from '../models/user.model.js'
import {uploadonCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from '../utils/apiResponse.js'
const registeruser= asyncHandler(async(req,res)=>{
      // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName, email,username, password}=req.body
    if (
    [
        fullName,
        email,
        username,
        password
    ].some((field)=>field.trim()==="")
    ) {
        throw new apiError(400,"Please fill all fields")
    }

    const existedUser= await User.findOne(
        {
            $or:[
                {username},
                {email}
            ]
        }
    )
    if(existedUser){
        throw new apiError(409,"User already exists")
    }
    const avatarLocalPath =req.files?.avatar[0]?.path;
   // const coverImageLocalPath =req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
    throw new apiError(400,"Please upload an avatar")
    }
    const avatar=await uploadonCloudinary(avatarLocalPath)
    const coverImage=await uploadonCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new apiError(400,"Error while uploading avatar")
    }
    User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url ||""
    })
    const createduser=await User.findById(User._id).select(
        "-password -refreshToken"
    )
    if(createduser){
        throw new apiError(500,"Error while creating user")
    }
    return res.status(201).json(
        new apiResponse(201,createduser,"User created successfully")
    )

})
const generateAccessTokenAndRefreshToken=async(userid)=>{
    try {
        const user=await User.findById(userid)
        const accessToken=await user.generateAccessToken()
        const refreshToken=await user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken} 


    } catch (error) {
        throw new apiError(500,"Error while generating tokens")
    }
}
const loginuser= asyncHandler(async(req,res)=>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie
    const{username,email,password}=req.body
    
    if(!username&&!email){
        throw new apiError(400,"username or email is required")
    }
    const user=await User.findOne(
        {
            $or:[{username},{email}]
        }
    )
    if(!user){
        throw new apiError(404,"User not found")
    }
    const ispasswordvalid= await user.isPasswordCorrect(password);
    if(!ispasswordvalid){
        throw new apiError(401,"invalid credentials")
    }

   const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(user._id)
   const loggedinuser=await User.findById(user._id).select("-password -refreshToken")
   const options={
    httpOnly:true,
    secure:true
   }
   console.log(username,password)
   return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedinuser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logoutuser=asyncHandler(async(req,res)=>{

   User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken: undefined
        }
    },
    {
        new:true
    }
   )
   
   const options={
    httpOnly:true,
    secure:true
   }

   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(
    200,{},"user logged out successfully"
   )
   
})




 export {registeruser,loginuser,logoutuser}