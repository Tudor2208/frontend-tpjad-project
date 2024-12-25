import React, { useState } from "react";
import RightSidePanel from "./RightSidePanel"; // Import the new RightSidePanel component
import "../css/SidePanel.css";

const SidePanel = () => {
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);
  const conversations = Array.from({ length: 50 }, (_, i) => `Conversation ${i + 1}`);

  // Toggle the visibility of the friends panel
  const toggleFriendsPanel = () => {
    setShowFriendsPanel(!showFriendsPanel);
  };

  return (
    <div className="side-panel">
      <button className="side-panel-btn" onClick={toggleFriendsPanel}>
        <i className="fa-solid fa-user-friends"></i> Friends
      </button>
      <button className="side-panel-btn">
        <i className="fa-solid fa-users"></i> Groups
      </button>
      <div className="conversations">
        {conversations.map((conversation, index) => (
          <div key={index} className="conversation">
            <i className="fa-solid fa-comment"></i> {conversation}
          </div>
        ))}
      </div>

      {/* Show the RightSidePanel when Friends button is clicked */}
      <RightSidePanel isVisible={showFriendsPanel} closePanel={toggleFriendsPanel} />
    </div>
  );
};

export default SidePanel;
