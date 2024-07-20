import express from 'express'
import { changePassword, followUnfollowUser, getUserProfile, loginUser, logoutUser, signupUser, updateUser } from '../controllers/user.controller.js';
import isAuthenticated from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/signup').post(signupUser);

router.route('/login').post(loginUser);

router.route('/logout').post(isAuthenticated, logoutUser);

router.route('/follow/:id').put(isAuthenticated, followUnfollowUser);

router.route('/update/:id').put(isAuthenticated, updateUser)

router.route('/password/update/:id').put(isAuthenticated, changePassword);

router.route('/profile/:query').get(getUserProfile);

export default router;