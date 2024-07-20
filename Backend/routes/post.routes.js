import express from 'express'

import isAuthenticated from '../middleware/auth.middleware.js';                                     
import { createPost, deletePost, getFeedPosts, getPost, getUserPosts, likeUnlikePost, replyToPost } from '../controllers/post.controller.js';

const router = express.Router();

router.route('/feed').get(isAuthenticated, getFeedPosts);

router.route('/create').post(isAuthenticated, createPost);

router.route('/user/:username').get(getUserPosts)

router.route('/:id').get(getPost);

router.route('/delete/:id').delete(isAuthenticated, deletePost);

router.route('/like/:id').put(isAuthenticated, likeUnlikePost);

router.route('/reply/:id').put(isAuthenticated, replyToPost);


export default router;