import React, { useState } from "react";
import "../css/RightSidePanel.css"; // Import the CSS for the RightSidePanel
import { toast } from 'sonner';

const RightSidePanel = ({ isVisible, closePanel }) => {
  // Example friend list (You can replace this with actual data)
  const friends = [
    "Friend 1",
    "Friend 2",
    "Friend 3",
    "Friend 4",
    "Friend 5",
    "Friend 6",
    "Friend 7",
    "Friend 8"
  ];

  const [inputUserId, setInputUserId] = useState("");
  
  // State to manage the search query
  const [searchQuery, setSearchQuery] = useState("");

  // Function to handle the search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter the friends based on the search query
  const filteredFriends = friends.filter((friend) =>
    friend.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addFriend = () => {
    if (inputUserId.trim() === "" || isNaN(inputUserId)) {
      toast.warning("Please enter a valid number for the ID");
    } else {
      toast.success("Your friend request has been successfully sent!");
    }
  }

  return (
    <div className={`right-side-panel ${isVisible ? "visible" : ""}`}>
      <button className="close-btn" onClick={closePanel}>
      &times;
      </button>
      <div className="friend-actions">
        <div className="add-friend">
          <input type="text" 
                placeholder="Enter user id" 
                value={inputUserId}
                onChange={(e) => setInputUserId(e.target.value)}/>
          <button onClick={addFriend} >Add Friend</button>
        </div>
        <div className="search-friend">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange} // Update the search query state
          />
        </div>
      </div>
      <div className="friends-list">
        {/* Render the filtered friends list */}
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend, index) => (
            <div key={index} className="friend-item">
              {friend}
            </div>
          ))
        ) : (
          <div className="no-friends">No friends found</div>
        )}
      </div>
    </div>
  );
};

export default RightSidePanel;
