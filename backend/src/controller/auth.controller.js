import express from 'express';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import generateToken from '../lib/utils.js'; // Default import
import cloudinary from '../lib/cloudinary.js';


export const signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check password length
        if (password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
        }

        // Check if email already exists
        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
            return res.status(400).json({ msg: 'Email already exists' });
        }

        // // Check if username already exists
        // const userByUsername = await User.findOne({ username });
        // if (userByUsername) {
        //     return res.status(400).json({ msg: 'Username already exists' });
        // }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        // Save user and generate token
        if (newUser) {
            await newUser.save();
            generateToken(newUser._id, res); // Generate token and set in cookie

            // Respond with user data
            // In auth.controller.js signup
            res.status(201).json({
                user: { // Add user object wrapper
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                },
                isLoggedIn: true // Add this
            });

        } else {
            res.status(400).json({ msg: 'Invalid user data' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid email' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid password' });
        }

        // Generate token
        generateToken(user._id, res);

        // Respond with user data
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

export const logout = (req, res) => {
    try {
        res.clearCookie("jwts", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const updateprofile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userID = req.user._id;

        if (!userID) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        if (!profilePic) {
            return res.status(400).json({ msg: 'Profile picture is required' });
        }

        const userprofilepic = await cloudinary.uploader.upload(profilePic);
        const userUpdate = await User.findByIdAndUpdate(
            userID,
            { profilePic: userprofilepic.secure_url },
            { new: true }
        );

        if (userUpdate) {
            res.status(200).json({ msg: 'Profile picture updated successfully', profilePic: userprofilepic.secure_url });
        } else {
            return res.status(400).json({ msg: 'Invalid user data' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}


export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch {
        console.error(err);
        res.status(500).send('Server error44');
    }

}