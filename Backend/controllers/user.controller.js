import mongoose from "mongoose";
import { Post } from "../models/post.model.js"
import { User } from "../models/user.model.js";

import generateTokenAndSetCookie from "../utils/generateTokensAndSetCookies.js";
import { v2 as cloudinary } from 'cloudinary'


const getUserProfile = async (req, res) => {
    const { query } = req.params;
    try {

        let user;

        if (mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findById({ _id: query }).select("-password -updatedAt");
        } else {
            user = await User.findOne({ username: query }).select("-password -updatedAt");
        }

        if (!user) return res.status(400).json({ error: "User not found" });

        res.status(200).json(user);

    } catch (error) {
        console.log("Error in getUserProfile", error.message)
        res.status(400).json({ error: error.message })
    }
}

const signupUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;
        console.log(req.body)
        if(name === "" ||  email === "" || username === "" || password === ""){
            return res.status(400).json({ error: "All fields are required" })
        }
        const user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            return res.status(400).json({ error: "User already exist" })
        }

        const newUser = await User.create({
            name,
            email,
            username,
            password,
        });

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)
            res.status(200).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilePic: newUser.profilePic
            })
        } else {
            res.status(400).json({ error: "Invalid user data" })
        }

    } catch (error) {
        console.log("Error in signupUser", error.message)
        res.status(500).json({ error: error.message })
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "All fields are required" })
        }

        const user = await User.findOne({ username });
        let isPasswordValid = false
        if (user) {
            isPasswordValid = await user.isPasswordCorrect(password);
        }
        if (!user || !isPasswordValid) {
            return res.status(400).json({ error: "Invalid username or password" })
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic
        })

    } catch (error) {
        console.log("Error in loginUser", error.message)
        res.status(500).json({ error: error.message })
    }
}

const logoutUser = (req, res) => {
    try {
        res.cookie("token", "", { maxAge: 1 })
        res.status(200).json({ message: "User loggeout successfully" })
    } catch (error) {
        console.log("Error in logoutUser", error.message)
        res.status(500).json({ error: error.message })
    }
}

const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id)

        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({ error: "User not found" })
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow user
            // Modify current user following, modify followers of userToModify
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
            res.status(200).json({ message: "User unfollowed succesfully" })
        } else {
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } })
            res.status(200).json({ message: "User followed succesfully" })
        }

    } catch (error) {
        console.log("Error in followUnfollowUser", error.message)
        res.status(500).json({ error: error.message })
    }
}

const updateUser = async (req, res) => {
    const { name, email, username, bio } = req.body;
    let { profilePic } = req.body;

    const userId = req.user?._id
    try {

        let user = await User.findOne(userId);
        if (!user) {
            return res.status(400).json({ error: "User not found" })
        }

        if (req.params.id !== userId.toString()) {
            return res.status(400).json({ error: "You cannot update other user's profile" });
        }

        if (profilePic) {
            if (user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0])
            }

            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = (await user.save())

        await Post.updateMany(
            {
                "replies.userId": userId,
            },
            {
                $set:{
                    "replies.$[reply].username" : user.username,
                    "replies.$[reply].userProfilePic": user.profilePic
                }
            },
            {
                arrayFilters:[{"reply.userId": userId}]
            })

        user.password = null

        res.status(200).json({ user })

    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log("Error in updateUser", error.message)
    }
}

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findOne(req.user?._id);

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

        if (!isPasswordCorrect) {
            res.status(400).json({ error: "Invalid old Password" });
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false })

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log("Error in changePassword", error.message)
    }
}



export { signupUser, loginUser, logoutUser, followUnfollowUser, changePassword, updateUser, getUserProfile };