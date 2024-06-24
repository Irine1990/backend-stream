import { Router } from "express";
import { toggleLikeVideo, toggleLikeComment, getLikedVideos } from "../controllers/like.controller.js";
import { secureVerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(secureVerifyJWT)

router.route("/v/:videoId").post(toggleLikeVideo)
router.route("/c/:commentId").post(toggleLikeComment)
router.route("/videos").get(getLikedVideos)

export default router