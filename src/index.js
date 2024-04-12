import connectDB from "./db/index.js";
//require("dotenv").config();
import { app } from "./app.js";
import dotenv from "dotenv";



dotenv.config({
    path: "./.env"
});


connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running on port ${process.env.PORT}`)
    })
    app.on("error",(error)=>{
        console.log("errrr:",error);
        throw error;
    })
})
.catch((error)=>{
    console.log("error ",error)
})
