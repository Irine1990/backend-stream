import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError.js";
import { config } from "dotenv";
config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("FILE UPLOADED SUCCESSFULLY: ",response.url)
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temp file as upload got failed
        throw new ApiError(410,"File Not uploaded to cloudinary",error)
    }
}

const deleteFromCloudinary = async (fileUrl) => {
    try {
        if(!fileUrl) return null;
        const publicId = await fileUrl.split('/').pop().split('.')[0];
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image"
        });
        console.log("FILE DELETED SUCCESSFULLY:", response);
        return response;
    } catch (error) {
        throw new ApiError(410, "File not deleted from cloudinary", error);
    }
}


export {uploadOnCloudinary,deleteFromCloudinary}
