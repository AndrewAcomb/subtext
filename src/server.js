const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

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

    socket.on('sendMessage', (message) => {
        // Send the message to all clients, including the sender's user name
        io.emit('receiveMessage', { text: message, user: userName });
    });

    socket.on('disconnect', () => {
        console.log(`${userName} disconnected`);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
