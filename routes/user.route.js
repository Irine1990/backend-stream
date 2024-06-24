import { Router } from "express";
import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    getCurrentUser
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { secureVerifyJWT, insecureVerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "coverimage",
            maxCount: 1
        },
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)
router.route("/logout").post(secureVerifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(secureVerifyJWT, changeCurrentPassword)
router.route("/update-account-details").patch(secureVerifyJWT, updateAccountDetails)
router.route("/avatar").patch(secureVerifyJWT, upload.single('avatar'), updateUserAvatar)
router.route("/cover-image").patch(secureVerifyJWT, upload.single('coverimage'), updateUserCoverImage)
router.route("/history").get(secureVerifyJWT, getWatchHistory)
router.route("/c/:username").get(insecureVerifyJWT, getUserChannelProfile)
router.route("/").get(insecureVerifyJWT, getCurrentUser)

export default router