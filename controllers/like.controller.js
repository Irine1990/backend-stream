import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Like } from "../models/like.model.js";

const toggleLikeVideo = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId
    if (!videoId) {
        throw new ApiError(400, "No video like or unlike")
    }

    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(410, "User not logged in")
    }

    const like = await Like.findOne({
        user: userId,
        video: videoId
    })

    if (like) {
        const deletedLike = await Like.findByIdAndDelete(like._id)
        if (!deletedLike) {
            throw new ApiError(420, "Not able to unlike the video")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, deletedLike, "Video unliked successfully")
            )
    }
    else {
        const like = await Like.create({
            user: userId,
            video: videoId,
        })

        if (!like) {
            throw new ApiError(420, "Not able to like the video")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, like, "Video liked successfully")
            )
    }
})

const toggleLikeComment = asyncHandler(async (req, res) => {
    const commentId = req.params?.commentId
    if (!commentId) {
        throw new ApiError(400, "No comment to like")
    }

    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User not logged in")
    }

    const like = await Like.findOne({
        user: userId,
        comment: commentId
    })

    if (like) {
        const deletedLike = await Like.findByIdAndDelete(like._id)
        if (!deletedLike) {
            throw new ApiError(420, "Not able to unlike the comment")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, deletedLike, "Comment unliked successfully")
            )
    }
    else {
        const like = await Like.create({
            user: userId,
            comment: commentId
        })

        if (!like) {
            throw new ApiError(400, "Not able to like the comment")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, like, "Comment liked successfuly")
            )
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User not logged in")
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline:[
                    {
                        $project:{
                            isPublished:0,
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$video"
        },
        {
            $project:{
                video:1
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
        )
})

export {
    toggleLikeVideo,
    toggleLikeComment,
    getLikedVideos
}