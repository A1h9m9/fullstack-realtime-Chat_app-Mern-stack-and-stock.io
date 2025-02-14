import express from "express";
import { protectRoute } from '../middleware/auth.middleware.js';
import { getUsersForSidebar } from '../controller/messages.controller.js'
import { getMessages, sendMessage } from '../controller/messages.controller.js'



const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages)

router.post("/send/:id", protectRoute, sendMessage);




export default router; 