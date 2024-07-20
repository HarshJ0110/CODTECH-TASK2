import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js"
import { v2 as cloudinary } from 'cloudinary'

const createPost = async (req, res) => {
    try {

        const { postedBy, text } = req.body;
        let { img } = req.body;

        const maxLength = 500;
        if (text.length > maxLength) {
            return res.status(400).json({ error: `Text must be less tha ${maxLength} characters` })
        }

        if (!postedBy || !text) {
            return res.status(400).json({ error: "Text field is required" })
        }

        const user = await User.findById(postedBy);

        console.log(req.user);

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized to create post" })
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = await Post.create({ postedBy, text, img });

        res.status(200).json(newPost)

        

    } catch (error) {
        console.log("Error in createPost", error.message)
        res.status(500).json({ error: error.message })
    }
}

const getPost = async (req, res) => {
    try {
        console.log(req.params.id);

        const post = await Post.findById(req.params.id);
        console.log(post);

        if (!post) {
            return res.status(400).json({ error: "Post not found" })
        }

        res.status(200).json(post);
    } catch (error) {
        console.log("Error in getPost", error.message)
        res.status(500).json({ error: error.message })
    }
}

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized to delete post" })
        }

        if(post.img){
            await cloudinary.uploader.destroy(post.img.split("/").slice(-1)[0].split(".")[0])
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post deleted successfully" })
    } catch (error) {
        console.log("Error in deletePost", error.message)
        res.status(500).json({ error: error.message })
    }
}

const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            // Unlike post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            res.status(200).json({ message: "Post unliked successfully" });
        } else {
            // Like post
            post.likes.push(userId);
            await post.save();
            res.status(200).json({ message: "Post liked successfully" });
        }
    } catch (error) {
        console.log("Error in likeUnlikePost", error.message)
        res.status(500).json({ error: error.message })

    }
}

const replyToPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
        const username = req.user.username;

        if (!text) {
            return res.status(400).json({ error: "Comment is required" })
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        const reply = { userId, text, userProfilePic, username };

        post.replies.push(reply);
        await post.save();

        res.status(200).json(reply);

    } catch (error) {
        console.log("Error in replyToPost", error.message)
        res.status(500).json({ error: error.message })
    }
}

const getFeedPosts = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ error: "user doesn't exist" })
        }

        const following = user.following;

        const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 })

        res.status(200).json(feedPosts)

    } catch (error) {
        console.log("Error in getFeedPosts", error.message)
        res.status(500).json({ error: error.message })
    }
}

const getUserPosts = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username })

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 })
        if (!posts) {
            return res.status(400).json({ error: "Post not found" })
        }

        res.status(200).json({ posts });
    } catch (error) {
        console.log("Error in getPost", error.message)
        res.status(500).json({ error: error.message })
    }
}

export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts}