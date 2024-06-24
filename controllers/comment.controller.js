import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const createComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const videoId = req.params?.videoId
    const userId = req.user?._id

    const comment = await Comment.create({
        content,
        video: videoId,
        commentBy: userId
    })

    if (!comment) {
        throw new ApiError(410, "Error while creating comment")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, comment, "Comment created successfully")
        )
})

const editComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const commentId = req.params?.commentId
    const userId = req.user?._id

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (!comment.commentBy.equals(userId)) {
        throw new ApiError(401, "Unauthorized request")
    }

    comment.content = content
    const updatedComment = await comment.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment updated successfully")
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.params?.commentId
    const userId = req.user?._id

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (!comment.commentBy.equals(userId)) {
        throw new ApiError(401, "Unauthorized request")
    }

    await Comment.deleteOne({ _id: commentId })

    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Comment deleted successfully")
        )
})

const getAllvideoComments = asyncHandler(async (req, res) => {
    const videoId = req.params?.videoId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitVal = parseInt(limit, 10);

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "commentBy",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $skip: skip },
        { $limit: limitVal }
    ]);

    // Calculate total count for pagination metadata
    const totalComments = await Comment.countDocuments({ video: videoId });
    const totalPages = Math.ceil(totalComments / limitVal);

    const result = {
        comments,
        page: parseInt(page, 10),
        limit: limitVal,
        totalPages,
        totalComments
    };

    return res
        .status(200)
        .json(
            new ApiResponse(200, result, "All comments fetched successfully")
        );
})

export {
    createComment,
    editComment,
    deleteComment,
    getAllvideoComments
}