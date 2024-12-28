import React, { useState, useEffect } from "react";
import "../css/FriendsPanel.css";
import { toast } from "sonner"; // Assuming you're using toast for notifications

const FriendsPanel = ({ isVisible, closePanel }) => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]); // New state for pending requests
  const [inputUserId, setInputUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch friends from API
  useEffect(() => {
    const fetchFriends = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id; // Assuming the userId is stored in localStorage
      const token = storedUser?.token;

      if (!userId || !token) {
        console.error("User not logged in");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/v1/friendships?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFriends(data); // Assuming the API returns an array of friends
        } else {
          console.error("Error fetching friends:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, []);

  // Fetch pending friend requests for the user
  useEffect(() => {
    const fetchPendingRequests = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id; // Assuming the userId is stored in localStorage
      const token = storedUser?.token;

      if (!userId || !token) {
        console.error("User not logged in");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/v1/friendships/pending?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPendingRequests(data); // Set the pending friend requests
        } else {
          console.error("Error fetching pending requests:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredFriends = friends.filter((friend) =>
    (friend.firstName + " " + friend.lastName).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addFriend = async () => {
    if (inputUserId.trim() === "" || isNaN(inputUserId)) {
      toast.warning("Please enter a valid number for the ID");
    } else {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id; // Get current user's ID
      const token = storedUser?.token;

      if (!userId || !token) {
        toast.error("User not logged in.");
        return;
      }

      // Check if the user is trying to send a friend request to themselves
      if (parseInt(inputUserId) === userId) {
        toast.warning("You can't send a friend request to yourself.");
        return;
      }

      try {
        // Send the friend request
        const response = await fetch(`http://localhost:8080/api/v1/friendships/${userId}/${inputUserId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Fetch the user's details to get their name
          const userResponse = await fetch(`http://localhost:8080/api/v1/users/${inputUserId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (userResponse.ok) {
            const user = await userResponse.json();
            // Show success toast with the user's full name
            toast.success(`${user.firstName} ${user.lastName} has received your friend request`);
          } else {
            toast.error("Failed to fetch user details.");
          }

          setInputUserId(""); // Clear the input field after success
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to send friend request.");
        }
      } catch (error) {
        console.error("Error adding friend:", error);
        toast.error("An error occurred while sending the friend request.");
      }
    }
  };

  // Accept Friend Request
  const acceptFriendRequest = async (friendId) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;
    const token = storedUser?.token;

    if (!userId || !token) {
      toast.error("User not logged in.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/v1/friendships/accept/${userId}/${friendId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Friend request accepted!");
        setPendingRequests(pendingRequests.filter((request) => request.id !== friendId)); // Remove from pending
      } else {
        toast.error("Failed to accept friend request.");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("An error occurred while accepting the friend request.");
    }
  };

  // Deny Friend Request
  const denyFriendRequest = async (friendId) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;
    const token = storedUser?.token;

    if (!userId || !token) {
      toast.error("User not logged in.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/v1/friendships/${userId}/${friendId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Friend request denied!");
        setPendingRequests(pendingRequests.filter((request) => request.id !== friendId)); // Remove from pending
      } else {
        toast.error("Failed to deny friend request.");
      }
    } catch (error) {
      console.error("Error denying friend request:", error);
      toast.error("An error occurred while denying the friend request.");
    }
  };

  return (
    <div className={`right-side-panel ${isVisible ? "visible" : ""}`}>
      <button className="close-btn" onClick={closePanel}>
        &times;
      </button>
      
      <div className="friend-actions">
        <div className="add-friend">
          <input
            type="text"
            placeholder="Enter user id"
            value={inputUserId}
            onChange={(e) => setInputUserId(e.target.value)}
          />
          <button onClick={addFriend}>Add Friend</button>
        </div>
        <div className="search-friend">
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Pending Friend Requests Section */}
      <h2>Pending Friend Requests</h2>
      <div className="pending-requests-list">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request, index) => (
            <div key={index} className="pending-request-item">
              <span>{request.firstName} {request.lastName}</span>
              <button
                className="accept-btn"
                onClick={() => acceptFriendRequest(request.id)}
              >
                <i className="fas fa-check"></i> Accept
              </button>
              <button
                className="deny-btn"
                onClick={() => denyFriendRequest(request.id)}
              >
                <i className="fas fa-times"></i> Deny
              </button>
            </div>
          ))
        ) : (
          <div className="no-pending-requests">No pending friend requests</div>
        )}
      </div>

      <h2>Your Friends</h2>
      <div className="friends-list">
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend, index) => (
            <div key={index} className="friend-item">
              {friend.firstName} {friend.lastName} (#{friend.id})
            </div>
          ))
        ) : (
          <div className="no-friends">No friends found</div>
        )}
      </div>
    </div>
  );
};

export default FriendsPanel;
