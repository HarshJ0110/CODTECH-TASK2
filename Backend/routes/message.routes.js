import express from 'express'
import { getConversations, getMessages, sendMessage } from '../controllers/message.controller.js';
import isAuthenticated from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/conversations').get(isAuthenticated , getConversations);
router.route('/:otherUserId').get(isAuthenticated , getMessages);
router.route('/').post(isAuthenticated ,sendMessage);

export default router