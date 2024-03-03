const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function getEmoji(message) {
    const gemini = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    const prompt = `Please respond only with a single emoji that best represents the tone and/or content of the following message: "${message}"`;
    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    return response.text();
}


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // Replace with the domain of your frontend app
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

let userCount = 0;

io.on('connection', (socket) => {
    userCount++;
    const userName = `User ${userCount}`;
    console.log(`${userName} connected`);
    socket.emit('yourUserName', userName);

    socket.on('sendMessage', async (message) => {
        try {
            const emoji = await getEmoji(message);
            io.emit('receiveMessage', { text: message, user: userName, emoji: emoji });
        } catch (error) {
            console.error('Error getting emoji:', error);
            io.emit('receiveMessage', { text: message, user: userName, emoji: '😊' });
        }
    });



    socket.on('disconnect', () => {
        console.log(`${userName} disconnected`);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
