import React, { useState, useEffect } from "react";
import "../css/FriendsPanel.css";
import { toast } from "sonner";

const FriendsPanel = ({ isVisible, closePanel, onFriendClick }) => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [inputUserId, setInputUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id;
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
          setFriends(data);
        } else {
          console.error("Error fetching friends:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, []);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id;
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
          setPendingRequests(data);
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
      const userId = storedUser?.id;
      const token = storedUser?.token;

      if (!userId || !token) {
        toast.error("User not logged in.");
        return;
      }

      if (parseInt(inputUserId) === userId) {
        toast.warning("You can't send a friend request to yourself.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/v1/friendships/${userId}/${inputUserId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userResponse = await fetch(`http://localhost:8080/api/v1/users/${inputUserId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (userResponse.ok) {
            const user = await userResponse.json();
            toast.success(`${user.firstName} ${user.lastName} has received your friend request`);
          } else {
            toast.error("Failed to fetch user details.");
          }

          setInputUserId("");
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
        setPendingRequests(pendingRequests.filter((request) => request.id !== friendId));
        window.location.reload(); 
      } else {
        toast.error("Failed to accept friend request.");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("An error occurred while accepting the friend request.");
    }
  };

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
        setPendingRequests(pendingRequests.filter((request) => request.id !== friendId)); 
      } else {
        toast.error("Failed to deny friend request.");
      }
    } catch (error) {
      console.error("Error denying friend request:", error);
      toast.error("An error occurred while denying the friend request.");
    }
  };

const removeFriend = async (friendId) => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;
  const token = storedUser?.token;

  if (!userId || !token) {
    toast.error("User not logged in.");
    return;
  }

  const confirmation = window.confirm("Are you sure you want to remove this friend?");
  if (!confirmation) {
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
      toast.success("Friend removed!");
      setFriends(friends.filter((friend) => friend.id !== friendId));
    } else {
      toast.error("Failed to remove friend.");
    }
  } catch (error) {
    console.error("Error removing friend:", error);
    toast.error("An error occurred while removing the friend.");
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
      </div>

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
                Deny
              </button>
            </div>
          ))
        ) : (
          <div className="no-pending-requests">No pending friend requests</div>
        )}
      </div>

      <h2>Your Friends</h2>
      <div className="search-friend">
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      <div className="friends-list">
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend, index) => (
            <div
              key={index}
              className="friend-item"
              onClick={() => onFriendClick(friend)}
            >
              {friend.firstName} {friend.lastName} (#{friend.id})
              <button className="remove-btn" onClick={() => removeFriend(friend.id)}>
                <i className="fas fa-times"></i> 
              </button>
              <button className="chat-btn" onClick={() => onFriendClick(friend)}>
                <i className="fas fa-comment"></i>
              </button>
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
