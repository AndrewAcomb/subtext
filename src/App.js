import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { MessageBox, Input, Button } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import './App.css';

const socket = io.connect('http://localhost:3001');

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [lastOtherVibe, setLastOtherVibe] = useState({ vibe: '', emotion: '', tone: '' });
  const [lastUserVibe, setLastUserVibe] = useState({ vibe: '', emotion: '', tone: '' });

  useEffect(() => {
    socket.on('yourUserName', (name) => {
      setUsername(name);
    });

    socket.on('receiveMessage', (messageObj) => {
      setMessages((prevMessages) => [...prevMessages, messageObj]);
      if (messageObj.user !== username) {
        setLastOtherVibe({ vibe: messageObj.vibe, emotion: messageObj.emotion, tone: messageObj.tone });
      } else {
        setLastUserVibe({ vibe: messageObj.vibe, emotion: messageObj.emotion, tone: messageObj.tone });
      }
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('yourUserName');
    };
  }, [username]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('sendMessage', message);
      setMessage('');
    }
  };

  const handleEnterKey = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <MessageBox
            key={index}
            position={msg.user === username ? 'right' : 'left'}
            style={{ background: msg.user === username ? 'blue' : 'gray' }}
            type="text"
            text={msg.text}
          />
        ))}
      </div>
      <Input
        placeholder="Type here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleEnterKey}
        rightButtons={
          <Button
            color="white"
            backgroundColor="black"
            text="Send"
            onClick={sendMessage}
          />
        }
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div>Vibe: {lastOtherVibe.vibe}</div>
          <div>Emotion: {lastOtherVibe.emotion}</div>
          <div>Tone: {lastOtherVibe.tone}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div>Vibe: {lastUserVibe.vibe}</div>
          <div>Emotion: {lastUserVibe.emotion}</div>
          <div>Tone: {lastUserVibe.tone}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
