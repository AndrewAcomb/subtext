import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { MessageBox, Input, Button } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';

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
      <div style={{ padding: '10px', background: '#ddd' }}>
        <strong>{username}</strong>
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <MessageBox
            key={index}
            title={msg.user}
            position={msg.user === username ? 'right' : 'left'}
            type="text"
            text={`${msg.text} ${msg.emoji}`}
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
