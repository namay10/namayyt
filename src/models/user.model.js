import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Jwt  from "jsonwebtoken";
const userSchema=new mongoose.Schema({
    username:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    avatar:{
        type:String,
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchhistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"password is required"],
        minlength:6,
    },
    refreshToken:{
        type:String
    }

},{timestamps:true})


userSchema.pre("save",async function(next){
    if(this.isModified("password"))
    this.password=await bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.isPasswordCorrect=async function(password){
    // isPasswordCorrect is the name of a function you've created, 
    // and then you're adding it to userSchema by using .methods. 
    // This effectively makes isPasswordCorrect available as a 
    // method on any instance of a model that uses userSchema, 
    // allowing you to easily check if a provided password matches 
    // the stored hashed password for a user.
   return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
    return Jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email,
        FullName:this.FullName
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken=function(){
    return Jwt.sign({
        _id:this.id
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}
export const User=mongoose.model("User",userSchema);