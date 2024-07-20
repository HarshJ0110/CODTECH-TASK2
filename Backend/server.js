import express from "express"
import dotenv from "dotenv"
import connectDb from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from './routes/user.routes.js'
import messageRoutes from './routes/message.routes.js'
import postsRoutes from './routes/post.routes.js'
import {v2 as cloudinary} from 'cloudinary'
import { app, server } from "./socket/socket.js";
import cors from 'cors'

dotenv.config()
connectDb();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// console.log( process.env.CLOUDINARY_CLOUD_NAME)


app.use(express.json({limit: "5mb"})); // to parse JSON data
app.use(express.urlencoded({extended: true })) // To parse form data in the req.body
app.use(cookieParser());
app.use(cors({ credentials: true, origin: `http://localhost:${process.env.PORT}` }));


//Routes
app.use('/api/users', userRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/messages', messageRoutes)

server.listen(process.env.PORT || 5000, () => console.log(`Server started at port ${process.env.PORT}`))
