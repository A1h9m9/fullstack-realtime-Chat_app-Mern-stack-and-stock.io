import express from "express";
import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: false ,

    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    },
    profilePic: {
        type: String,
        default: "",
    },
}, {
    createdAt: {
        type: Date,
        default: Date.now,
    },
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;