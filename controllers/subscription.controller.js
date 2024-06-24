import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Subscription } from "../models/subscription.model.js";

const togglesubscription = asyncHandler(async (req, res) => {
    const channelId = req.params.channelId
    if (!channelId) {
        throw new ApiError(400, "No channel to subscribe or unsubscribe")
    }

    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(410, "User not logged in")
    }

    const subscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })

    if (subscription) {
        const deletedSubscription = await Subscription.findByIdAndDelete(subscription._id)
        if (!deletedSubscription) {
            throw new ApiError(420, "Not able to unsubscribe the channel")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, deletedSubscription, "Channel unsubscribed successfully"))
    }
    else {
        const newSubscription = await Subscription.create({
            subscriber: userId,
            channel: channelId
        })

        if (!newSubscription) {
            throw new ApiError(420, "Not able to subscribe the channel")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, newSubscription, "Channel subscribed successfully"))
    }
})

const getSubscriptions = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(410, "User not logged in")
    }

    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                subscriber: userId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            avatar: 1,
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                channel: {
                    $first: "$channel"
                }
            }
        },
        {
            $project: {
                channel: 1
            }
        }
    ])

    if (!subscriptions) {
        throw new ApiError(420, "Not able to get subscriptions")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscriptions, "Subscriptions fetched successfully"))
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const channelId = new mongoose.Types.ObjectId(req.params.channelId)
    if (!channelId) {
        throw new ApiError(410, "User not logged in")
    }

    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                channel: channelId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            avatar: 1,
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscriber: {
                    $first: "$subscriber"
                }
            }
        },
        {
            $project: {
                subscriber: 1
            }
        }
    ])

    if (!subscriptions) {
        throw new ApiError(420, "Not able to get subscribers")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscriptions, "Subscribers fetched successfully"))
})

export {
    togglesubscription,
    getSubscriptions,
    getUserChannelSubscribers,
}