import React, { useState, useEffect, useRef } from "react";
import "font-awesome/css/font-awesome.min.css";
import "../css/ChatComponent.css";

const ChatComponent = ({ conversation, closeChat, userId1 }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const chatBoxRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.token;

      if (!token) {
        console.error("Token not found.");
        return;
      }

      try {
        const endpoint = conversation.privateConversation
          ? `http://localhost:8081/api/v1/messages/conversation?userId1=${userId1}&userId2=${conversation.friendId}`
          : `http://localhost:8081/api/v1/group-messages/${conversation.groupId}`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!conversation.privateConversation) {
          const messagesWithSenderNames = await Promise.all(
            data.map(async (msg) => {
              const userResponse = await fetch(
                `http://localhost:8080/api/v1/users/${msg.senderId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const userData = await userResponse.json();
              return {
                ...msg,
                senderFirstName: userData.firstName,
                senderLastName: userData.lastName,
              };
            })
          );
          setMessages(messagesWithSenderNames);
        } else {
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [conversation, userId1]);

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

      setMessages([
        ...messages,
        {
          senderId: loggedInUserId,
          text: newMessage,
          timestamp: timestamp,
          edited: false,
        },
      ]);
      setNewMessage("");

      try {
        const endpoint = conversation.privateConversation
          ? "http://localhost:8081/api/v1/messages"
          : `http://localhost:8081/api/v1/group-messages`;

        const body = conversation.privateConversation
          ? {
              text: newMessage,
              senderId: loggedInUserId,
              recipientId: conversation.friendId,
            }
          : {
              text: newMessage,
              senderId: loggedInUserId,
              groupId: conversation.groupId,
            };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser?.token}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          console.error("Error sending message:", response.statusText);
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

  const handleEditMessage = async (messageId) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    if (editingText.trim()) {
      try {
        const endpoint = conversation.privateConversation
          ? `http://localhost:8081/api/v1/messages/${messageId}`
          : `http://localhost:8081/api/v1/group-messages/${messageId}`;

        const response = await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: editingText }),
        });

        if (response.ok) {
          setMessages(
            messages.map((msg) =>
              msg.id === messageId ? { ...msg, text: editingText, edited: true } : msg
            )
          );
          setEditingMessageId(null);
          setEditingText("");
        } else {
          console.error("Error editing message:", response.statusText);
        }
      } catch (error) {
        console.error("Error editing message:", error);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    try {
      const endpoint = conversation.privateConversation
        ? `http://localhost:8081/api/v1/messages/${messageId}`
        : `http://localhost:8081/api/v1/group-messages/${messageId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages(messages.filter((msg) => msg.id !== messageId));
      } else {
        console.error("Error deleting message:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="chat-component">
      <button className="close-btn" onClick={closeChat}>
        &times;
      </button>
      <h3>
        Chat with{" "}
        {conversation.privateConversation
          ? `${conversation.firstName} ${conversation.lastName}`
          : `Group: ${conversation.groupName}`}
      </h3>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.length === 0 ? (
          <div className="no-messages">Start the conversation...</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.senderId === JSON.parse(localStorage.getItem("user"))?.id
                  ? "sent"
                  : "received"
              }`}
            >
              <div className="message-text">
                {editingMessageId === msg.id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleEditMessage(msg.id)
                    }
                    autoFocus
                  />
                ) : (
                  <>
                    {conversation.privateConversation ? (
                      msg.text
                    ) : (
                      <>
                        {msg.senderId !== JSON.parse(localStorage.getItem("user"))?.id && (
                          <strong id="sender-name">{msg.senderFirstName} {msg.senderLastName}: </strong>
                        )}
                        {msg.text}
                      </>
                    )}
                    {msg.edited && <span className="edited-text"> (Edited)</span>}
                  </>
                )}
              </div>
              <div className="message-time">{formatTimestamp(msg.timestamp)}</div>
              {msg.senderId === JSON.parse(localStorage.getItem("user"))?.id && (
                <div className="message-actions">
                  <button
                    onClick={() => {
                      setEditingMessageId(msg.id);
                      setEditingText(msg.text);
                    }}
                  >
                    <i id="chat-edit" className="fa fa-edit"></i>
                  </button>
                  <button onClick={() => handleDeleteMessage(msg.id)}>
                    <i id="chat-delete" className="fa fa-trash"></i>
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
