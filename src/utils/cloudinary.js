import { v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
const uploadonCloudinary= async(localfilepath)=>{
  try {
    if(!localfilepath){
      return null;
    }
    const response= await cloudinary.uploader.upload(localfilepath,{resource_type:"auto"})
    //console.log("file is uploaded on cloudinary",response.url)
    fs.unlinkSync(localfilepath)// remove the locally saved temporary file after uploading it on cloudinary
    return response;
  } catch (error) {
    fs.unlinkSync(localfilepath)
    console.log("error while uploading file on cloudinary",error)// remove the locally saved temporary file as the upload operation got failed
    return null;
  }
}
export {uploadonCloudinary}