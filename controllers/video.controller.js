import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Video } from "../models/video.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    console.log(req.body)

    let videoLocalPath
    let thumbnailLocalPath
    if (req.files?.video) videoLocalPath = req.files?.video[0]?.path
    if (req.files?.thumbnail) thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if ([title, description, videoLocalPath, thumbnailLocalPath].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required")
    }

    const videoResource = await uploadOnCloudinary(videoLocalPath)
    const thumbnailResource = await uploadOnCloudinary(thumbnailLocalPath)

    if ([videoResource, thumbnailResource].some((field) => field?.trim === "")) {
        throw new ApiError(400, "Video or Thumbnail not uplaoded to cloudinary")
    }

    const owner = req?.user?._id
    const isPublished = true

    const video = await Video.create({
        title,
        description,
        videoFile: videoResource.url,
        thumbnailFile: thumbnailResource.url,
        owner,
        duration: videoResource.duration,
        views: 0,
        isPublished
    })

    if (!video) {
        throw new ApiError(410, "Error while uploading video")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video uploaded successfully")
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if ([title, description].some((field) => !field?.trim())) {
        throw new ApiError(400, "Title and Description are required")
    }

    const videoId = req.params?.videoId
    const video = await Video.findById(videoId)
    if (!video) { throw new ApiError(404, "Video not found") }

    const userId = req.user?._id

    if (!userId || !video.owner.equals(userId)) {
        throw new ApiError(400, "Unauthorized request")
    }

    const thumbnailLocalPath = req.file?.path
    const thumbnailResource = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnailResource) {
        throw new ApiError(400, "Thumbnail not uploaded to cloudinary")
    }

    await deleteFromCloudinary(video.thumbnailFile)

    const updatedVideo = await Video.findByIdAndUpdate(videoId, {
        title,
        description,
        thumbnailFile: thumbnailResource.url
    }, { new: true })

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, "Video updated successfully")
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const videoId = req.params?.videoId
    const userId = req.user?._id
    const video = await Video.findById(videoId)
    if (!video) { throw new ApiError(404, "Video not found") }

    if (!userId || !video.owner.equals(userId)) {
        throw new ApiError(400, "Unauthorized request")
    }

    await deleteFromCloudinary(video.videoFile)
    await Video.deleteOne({ _id: videoId })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "File deleted successfully")
        )
})

const getVideo = asyncHandler(async (req, res) => {
    const videoId = req.params?.videoId
    const video = await Video.findById(videoId)
    if (!video) { throw new ApiError(404, "Video not found") }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video fetched successfully")
        )
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const aggregateQuery = Video.aggregate([
        {
            $match: {
                isPublished: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline:[
                    {
                        $project:{
                            avatar:1,
                            username:1
                        }
                    }
                ]
            }
        }
    ]);

    const videos = await Video.aggregatePaginate(aggregateQuery, options);

    return res
        .status(200)
        .json(
            new ApiResponse(200, videos, "All videos fetched successfully")
        )
})

export {
    uploadVideo,
    updateVideo,
    deleteVideo,
    getVideo,
    getAllVideos
}