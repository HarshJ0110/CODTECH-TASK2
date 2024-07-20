import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ error: "Unauthorized Access" })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decode.userId).select("-password");
        req.user = user;
        next();

    } catch (error) {
        res.status(400).json({ message: error.message })
        console.log("Error in isAuthenticated : ", error.message)
    }
}

export default isAuthenticated;