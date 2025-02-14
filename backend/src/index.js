import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/messages.routes.js'
import { connectdb } from './lib/db.js';
import { app, server } from './lib/socket.js'

dotenv.config(); // Load environment variables from .env file

// Connect to MongoDB
connectdb();

// Middleware to parse JSON bodies
app.use(express.json());

// **Place cookie-parser middleware BEFORE your routes**
app.use(cookieParser());


// Middleware for CORS
app.use(cors({
    origin: "http://localhost:5173",  // Fixed the origin URL
    credentials: true  // Allow cookies to be sent with requests from the specified origin
}));
// Mount the auth routes at /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);


const PORT = process.env.PORT || 5001;  // Fallback to 5001 if PORT is not set

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
