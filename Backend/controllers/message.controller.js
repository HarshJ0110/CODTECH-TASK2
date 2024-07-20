import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getRecipientSocketId } from "../socket/socket.js";
import { io } from "../socket/socket.js";

const sendMessage = async (req, res) => {
    try {
        const { recipitentId, message } = req.body;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipitentId] }
        })

        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipitentId],
                lastMessage: {
                    text: message,
                    sender: senderId
                }
            })
            await conversation.save()
        }

        const newMessage = new Message({
            conversationId: conversation._id,
            sender: senderId,
            text: message
        })

        await Promise.all([
            newMessage.save(),
            conversation.updateOne({
                lastMessage: {
                    text: message,
                    sender: senderId
                }
            })

        ])

        const recipientSocketId = getRecipientSocketId(recipitentId);
        
        if(recipientSocketId){
            io.to(recipientSocketId).emit("newMessage", newMessage)
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage", error.message)
        res.status(500).json({ error: error.message })
    }
}

const getMessages = async (req, res) => {
    const { otherUserId } = req.params;
    const userId = req.user._id;
    try {

        const conversation = await Conversation.findOne({
            participants: { $all: [userId, otherUserId] }
        })

        if (!conversation) {
            return res.status(200).json({ error: "Conversation not found" })
        }

        const message = await Message.find({
            conversationId: conversation._id
        }).sort({ createdAt: 1 })

        res.status(200).json(message)

    } catch (error) {
        console.log("Error in sendMessage", error.message)
        res.status(500).json({ error: error.message })
    }
}

const getConversations = async (req, res) => {
    const userId = req.user._id;
    try {
        const conversations = await Conversation.find({ participants: userId }).populate({
            path: "participants",
            select: "username profilePic"
        })

        if(!conversations){
            return res.status(404).json({error: "Conversation not found"})
        }

        conversations.forEach(conversation => {
            conversation.participants = conversation.participants.filter(participant => participant._id.toString() !== userId.toString())
        });

        res.status(200).json(conversations)

    } catch (error) {
        console.log("Error in sendMessage", error.message)
        res.status(500).json({ error: error.message })
    }
}

export { sendMessage, getMessages, getConversations };