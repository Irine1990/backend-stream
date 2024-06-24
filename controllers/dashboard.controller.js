import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user?._id

    if (!channelId) {
        throw new ApiError(400, "Channel ID is not present")
    }

    const subscribersCount = await Subscription.countDocuments({
        channel: channelId
    })

    const videos = await Video.aggregate([
        {
            $match: {
                owner: channelId
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $project: {
                title: 1,
                thumbnailFile: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1,
                likes: {
                    $size: "$likes"
                }
            }
        },
    ])

    const { totalLikes, totalViews } = videos.reduce((acc, video) => {
        acc.totalLikes += video.likes
        acc.totalViews += video.views
        return acc
    }, { totalLikes: 0, totalViews: 0 })

    const result = {
        subscribersCount,
        totalLikes,
        totalViews,
        videos,
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, result, "Channel stats fetched successfully")
        )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user?._id

    if (!channelId) {
        throw new ApiError(400, "Channel ID is not present")
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: channelId
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likes: {
                    $size: "$likes"
                }
            }
        },
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"Videos fetched successfully")
    )
})

export {
    getChannelStats,
    getChannelVideos,
}