const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function getVibe(message) {
    const gemini = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    const prompt = `How would you represent the vibe, tone and emotion of the following message: "${message}"?
    Please respond with ONLY a valid JSON string with the following fields: {vibe: messageVibe, emotion: emotionDescription, tone: toneDescription} where messageVibe is a single emoji representing the vibe of the message, emotionDescription is one of the following words ["Joy","Sadness","Anger","Fear","Surprise","Disgust","Love","Hate","Excitement","Contentment","Guilt","Shame","Pride","Jealousy","Envy","Compassion","Empathy","Sympathy","Anxiety","Relief"], and toneDescription is one of the following words  ["Formal","Informal","Humorous","Serious","Sarcastic","Playful","Authoritative","Persuasive","Sympathetic","Objective","Subjective","Optimistic","Pessimistic","Confident","Doubtful","Encouraging","Discouraging","Neutral","Casual","Intense"]`;
    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    return response.text();
}


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
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
            const vibeData = await getVibe(message);
            const jsonMatch = vibeData.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[0];

                const { vibe, emotion, tone } = JSON.parse(jsonStr);
                io.emit('receiveMessage', { text: message, user: userName, vibe: vibe, emotion: emotion, tone: tone });
            } else {
                console.error('Error parsing vibe data:', vibeData);
                io.emit('receiveMessage', { text: message, user: userName, vibe: '', emotion: '', tone: '' });
            }
        } catch (error) {
            console.error('Error getting vibe data:', error);
            io.emit('receiveMessage', { text: message, user: userName });
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
