import React, { useState, useEffect, useRef } from "react";
import 'font-awesome/css/font-awesome.min.css';

import "../css/ChatComponent.css";

const ChatComponent = ({ conversation, closeChat, userId1, userId2 }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState(""); // Initialize as empty string to avoid undefined issues
  const chatBoxRef = useRef(null);

  // Fetch messages from the API
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

  // Scroll to the bottom when new messages arrive
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

      // Initially set 'edited' to false when sending a new message
      setMessages([
        ...messages,
        { senderId: loggedInUserId, text: newMessage, timestamp: timestamp, edited: false },
      ]);
      setNewMessage(""); // Reset the input field

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

  const handleDeleteMessage = async (messageId) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    try {
      const response = await fetch(`http://localhost:8081/api/v1/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages(messages.filter((msg) => msg.id !== messageId)); // Remove the deleted message from the UI
        console.log("Message deleted successfully");
      } else {
        console.error("Error deleting message:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleEditMessage = async (messageId) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    if (editingText.trim()) {
      try {
        const response = await fetch(`http://localhost:8081/api/v1/messages/${messageId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: editingText }),
        });

        if (response.ok) {
          // Update the message in state with the new text and mark as edited
          setMessages(messages.map((msg) =>
            msg.id === messageId ? { ...msg, text: editingText, edited: true } : msg
          ));
          setEditingMessageId(null);
          setEditingText(""); // Reset editing text after successful edit
          console.log("Message edited successfully");
        } else {
          console.error("Error editing message:", response.statusText);
        }
      } catch (error) {
        console.error("Error editing message:", error);
      }
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
              <div className="message-text">
                {editingMessageId === msg.id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleEditMessage(msg.id);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    {msg.text}
                    {msg.edited && <span className="edited-text"> (Edited)</span>}
                  </>
                )}
              </div>
              <div className="message-time">{formatTimestamp(msg.timestamp)}</div>
              {msg.senderId === JSON.parse(localStorage.getItem("user"))?.id && (
                <div className="message-actions">
                  <button onClick={() => { setEditingMessageId(msg.id); setEditingText(msg.text || ""); }}>
                    <i className="fa fa-edit"></i>
                  </button>
                  <button onClick={() => handleDeleteMessage(msg.id)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={handleMessageChange}
          onKeyDown={handleKeyPress}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>
          <i className="fa fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
