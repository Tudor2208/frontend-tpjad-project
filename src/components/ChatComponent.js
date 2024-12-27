import React, { useState, useEffect, useRef } from "react";
import "../css/ChatComponent.css";

const ChatComponent = ({ conversation, closeChat, userId1, userId2 }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatBoxRef = useRef(null);


  useEffect(() => {
    const fetchMessages = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.token;
      const loggedInUserId = storedUser?.id;

      if (!token || !loggedInUserId) {
        console.error("Token or User ID not found.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8081/api/v1/messages/conversation?userId1=${userId1}&userId2=${userId2}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          console.error("API response is not an array:", data);
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [userId1, userId2]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  const sendMessage = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const loggedInUserId = storedUser?.id;
    if (newMessage.trim()) {
      const timestamp = Date.now(); 
      const recipientId = userId1 === loggedInUserId ? userId2 : userId1;

      setMessages([
        ...messages,
        { senderId: loggedInUserId, text: newMessage, timestamp: timestamp },
      ]);
      setNewMessage(""); 

      try {
        const response = await fetch("http://localhost:8081/api/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser?.token}`,
          },
          body: JSON.stringify({
            text: newMessage,
            senderId: loggedInUserId,
            recipientId: recipientId,
          }),
        });

        if (response.ok) {
          console.log("Message saved successfully");
        } else {
          console.error("Error saving message:", response.statusText);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && newMessage.trim()) {
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  };

  return (
    <div className="chat-component">
      <button className="close-btn" onClick={closeChat}>
        &times;
      </button>
      <h3>Chat with {conversation.firstName} {conversation.lastName}</h3>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.length === 0 ? (
          <div className="no-messages">Start the conversation...</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.senderId === JSON.parse(localStorage.getItem("user"))?.id ? "sent" : "received"}`}
            >
              <div className="message-text">{msg.text}</div>
              <div className="message-time">{formatTimestamp(msg.timestamp)}</div>
            </div>
          ))
        )}
      </div>
      <div className="message-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleMessageChange}
          onKeyDown={handleKeyPress}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;
