import { Router } from "express";
import {
    togglesubscription,
    getSubscriptions,
    getUserChannelSubscribers,
} from "../controllers/subscription.controller.js";
import { secureVerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/")
    .get(getSubscriptions)

router.route("/c/:channelId")
    .post(secureVerifyJWT ,togglesubscription)
    .get(getUserChannelSubscribers)

export default router