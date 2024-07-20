import { Server } from 'socket.io';
import http from 'http';
import express from 'express'
// import cors from 'cors'
import Message from '../models/message.model.js'
import Conversation from '../models/conversation.model.js';

const app = express();
const server = http.createServer(app)
const io = new Server(server, {
    cors: { credentials: true, origin: 'http://localhost:3000' }
})

const userSocketMap = {}

io.on("connection", (socket) => {
    console.log("user connected", socket.id)
    const userId = socket.handshake.query.userId;

    if (userId !== undefined) {
        userSocketMap[userId] = socket.id
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
        try {
            await Message.updateMany({ conversationId: conversationId, seen: false }, { $set: { seen: true } })
            await Conversation.updateOne({ _id: conversationId }, { $set: { "lastMessage.seen": true } });
            io.to(userSocketMap[userId]).emit("messageSeen", { conversationId });
        } catch (error) {
            console.log(error.message)
        }
    })

    socket.on("disconnect", () => {
        console.log("user disconnected")
        delete userSocketMap[userId],
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export const getRecipientSocketId = (recipitentId) => {
    return userSocketMap[recipitentId]
}

export { io, server, app };