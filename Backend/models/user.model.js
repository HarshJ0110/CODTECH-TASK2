import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs"


const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minLength: 6,
        required: true,
    },
    profilePic: {
        type: String,
        default: "",
    },
    followers: {
        type: [String],
        default: [],
    },
    following: {
        type: [String],
        default: [],
    },
    bio: {
        type: String,
        default: "",
    }
}, {
    timestamps: true
})


userSchema.pre('save', async function (next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function(pass){
    return await bcrypt.compare(pass , this.password)
}

export const User = mongoose.model('User', userSchema);
