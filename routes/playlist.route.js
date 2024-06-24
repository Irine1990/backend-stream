import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import {secureVerifyJWT, insecureVerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/")
    .post(secureVerifyJWT,createPlaylist)

router.route("/u/:userId")
    .get(insecureVerifyJWT,getUserPlaylists)

router.route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist)

router.route("/add/:playlistId/:videoId")
    .patch(addVideoToPlaylist)

router.route("/remove/:playlistId/:videoId")
    .patch(removeVideoFromPlaylist)

export default router