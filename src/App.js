import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { MessageBox, Input, Button } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';

const MessageWithDetails = ({ msg, currentUser }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
      <MessageBox
        position={msg.user === currentUser ? 'right' : 'left'}
        type="text"
        text={msg.text}
      />
      <div style={{ display: 'flex', justifyContent: msg.user === currentUser ? 'flex-end' : 'flex-start' }}>
        {msg.vibe ? <span style={{ margin: '0 8px', fontSize: 'smaller' }}>{`Vibe: ${msg.vibe}`}</span> : undefined}
        {msg.emotion ? <span style={{ margin: '0 8px', fontSize: 'smaller' }}>{`Emotion: ${msg.emotion}`}</span> : undefined}
        {msg.tone ? <span style={{ margin: '0 8px', fontSize: 'smaller' }}>{`Tone: ${msg.tone}`}</span> : undefined}

      </div>
    </div>
  );
};

const socket = io.connect('http://localhost:3001');

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    socket.on('yourUserName', (name) => {
      if (!username) setUsername(name);
    });

    socket.on('receiveMessage', (messageObj) => {
      setMessages((prevMessages) => [...prevMessages, messageObj]);
    });

    // Cleanup subscription on unmount
    return () => {
      socket.off('receiveMessage');
      socket.off('yourUserName');
    }
  }, []);


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
          <MessageWithDetails
            msg={msg}
            currentUser={username}
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
    </div>
  );
}

export default App;
