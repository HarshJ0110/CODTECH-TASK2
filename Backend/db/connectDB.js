import mongoose from "mongoose"
const connectDb = async() => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Mongodb Connected: ${connect.connection.host}`)
        // console.log(process)
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

export default connectDb;