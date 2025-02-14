import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Generate JWT token
const generateToken = (user_id, res) => {
    const token = jwt.sign({ user_id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    // Set cookie
    res.cookie('jwts', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 15 * 24 * 60 * 60 * 1000 // 15 days
    });


        
};

export default generateToken;