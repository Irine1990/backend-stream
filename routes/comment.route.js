import { Router } from "express";
import {
    createComment,
    editComment,
    deleteComment,
    getAllvideoComments
} from "../controllers/comment.controller.js";
import { secureVerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/v/:videoId")
    .post(secureVerifyJWT,createComment)
    .get(getAllvideoComments)

router.route("/c/:commentId")
    .patch(secureVerifyJWT,editComment)
    .delete(secureVerifyJWT,deleteComment)

export default router