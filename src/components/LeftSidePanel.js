import React, { useState, useEffect } from "react";
import FriendsPanel from "./FriendsPanel"; // Ensure you have this component
import ChatComponent from "./ChatComponent";
import "../css/LeftSidePanel.css";

const LeftSidePanel = () => {
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [userName, setUserName] = useState("");
  const [conversations, setConversations] = useState([]);
  const [userId, setUserId] = useState(""); // Store userId
  
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.firstName) {
      setUserName(storedUser.firstName);
      setUserId(storedUser.id); // Get the userId from localStorage
    } else {
      setUserName("Guest");
    }

    const token = storedUser?.token;
    const userId = storedUser?.id;

    if (token && userId) {
      fetchConversations(token, userId);
    }
  }, []);

  const fetchConversations = async (token, userId) => {
    try {
      const response = await fetch(
        `http://localhost:8081/api/v1/messages/conversations/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const handleConversationClick = (conversation) => {
    if (conversation === selectedConversation) {
      setSelectedConversation(null); // Close the chat if the same conversation is clicked
    } else {
      setSelectedConversation(conversation); // Open the chat for the clicked conversation
    }
    setShowFriendsPanel(false); // Close the friends panel when a conversation is clicked
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
  
    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  };

  return (
    <div className="side-panel">
      <div className="welcome-message">
        Hello, {userName}!
      </div>

      <button className="side-panel-btn" onClick={() => setShowFriendsPanel(!showFriendsPanel)}>
        <i className="fa-solid fa-user-friends"></i> Friends
      </button>
      <button className="side-panel-btn">
        <i className="fa-solid fa-users"></i> Groups
      </button>

      {/* Conditionally render the FriendsPanel */}
      <FriendsPanel isVisible={showFriendsPanel} closePanel={() => setShowFriendsPanel(false)} />

      <div className="conversations">
        {conversations.map((conversation, index) => (
          <div
            key={index}
            className={`conversation ${conversation === selectedConversation ? "selected" : ""}`}
            onClick={() => handleConversationClick(conversation)}
          >
            <div className="conversation-header">
              <span className="conversation-name">
                {conversation.firstName} {conversation.lastName}
              </span>
            </div>
            <div className="conversation-last-message">
              <small>{conversation.sent ? "YOU: " : ""}{conversation.lastMessage}</small>
            </div>
            <div className="conversation-timestamp">
              <small>{formatTimestamp(conversation.lastMessageTimestamp)}</small>
            </div>
          </div>
        ))}
      </div>

      {selectedConversation && (
        <ChatComponent
          conversation={selectedConversation}
          closeChat={() => setSelectedConversation(null)}
          userId1={userId}
          userId2={selectedConversation.friendId}
        />
      )}
    </div>
  );
};

export default LeftSidePanel;