import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSocketHandlers } from './socketHandlers.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration - allow multiple frontend ports
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL
    ].filter(Boolean), // Remove undefined/null values
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io setup with explicit transport configuration
const io = new Server(httpServer, {
    cors: corsOptions,
    transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
    allowEIO3: true, // Allow older clients
    pingTimeout: 60000,
    pingInterval: 25000
});

// Setup socket event handlers
setupSocketHandlers(io);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Live Polling Server is running' });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io ready for connections`);
});
