import { Router } from "express";
import {
    uploadVideo,
    updateVideo,
    deleteVideo,
    getVideo,
    getAllVideos
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { secureVerifyJWT, insecureVerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router
    .route("/")
    .get(insecureVerifyJWT, getAllVideos)
    .post(
        secureVerifyJWT,
        upload.fields([
            {
                name: "video",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        uploadVideo
    )
router
    .route("/:videoId")
    .delete(secureVerifyJWT, deleteVideo)
    .get(insecureVerifyJWT, getVideo)
    .patch(secureVerifyJWT, upload.single("thumbnail"), updateVideo)


export default router