import React from "react";
import "../css/SidePanel.css";

const SidePanel = () => {
  const conversations = Array.from({ length: 50 }, (_, i) => `Conversation ${i + 1}`);

  return (
    <div className="side-panel">
      <button className="side-panel-btn">
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
    </div>
  );
};

export default SidePanel;
