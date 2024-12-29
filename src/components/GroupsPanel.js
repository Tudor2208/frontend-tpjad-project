import React, { useState, useEffect } from "react";
import "../css/GroupsPanel.css";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const GroupsPanel = ({ isVisible, closePanel, onGroupClick }) => {
  const [pendingInvites, setPendingInvites] = useState([]);
  const [userIdToInvite, setUserIdToInvite] = useState("");
  const [ownerGroups, setOwnerGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id;
      const token = storedUser?.token;
  
      if (!userId || !token) {
        console.error("User not logged in");
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:8081/api/v1/groups?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          const ownedGroups = data.filter((group) => group.ownerId === userId);
          setOwnerGroups(ownedGroups); 
        } else {
          console.error("Error fetching groups:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
  
    fetchGroups();
  }, []);
  
  useEffect(() => {
    const fetchPendingInvites = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id;
      const token = storedUser?.token;

      if (!userId || !token) {
        console.error("User not logged in");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8081/api/v1/invites?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          const invitesWithOwner = await Promise.all(
            data.map(async (invite) => {
              const ownerResponse = await fetch(`http://localhost:8080/api/v1/users/${invite.ownerId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (ownerResponse.ok) {
                const ownerData = await ownerResponse.json();
                return {
                  ...invite,
                  ownerName: `${ownerData.firstName} ${ownerData.lastName}`,
                };
              } else {
                console.error("Error fetching owner data");
                return invite;
              }
            })
          );

          setPendingInvites(invitesWithOwner);
        } else {
          console.error("Error fetching pending invites:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching pending invites:", error);
      }
    };

    fetchPendingInvites();
  }, []);

  const handleInvite = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    if (!userIdToInvite || !selectedGroupId) {
      toast.error("Please provide a user ID and select a group.");
      return;
    }

    if (!token) {
      toast.error("User not logged in.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/v1/invites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userIdToInvite, groupId: selectedGroupId }),
      });

      if (response.ok) {
        toast.success("User invited successfully!");
        setUserIdToInvite("");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to invite user.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("An error occurred while inviting the user.");
    }
  };

  const acceptGroupInvite = async (inviteId) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    if (!token) {
      toast.error("User not logged in.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/v1/invites/${inviteId}/accept-invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Group invite accepted!");
        setPendingInvites(pendingInvites.filter((invite) => invite.id !== inviteId));
      } else {
        toast.error("Failed to accept group invite.");
      }
    } catch (error) {
      console.error("Error accepting group invite:", error);
      toast.error("An error occurred while accepting the group invite.");
    }
  };

  const denyGroupInvite = async (inviteId) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    if (!token) {
      toast.error("User not logged in.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/v1/invites/${inviteId}/deny-invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Group invite denied!");
        setPendingInvites(pendingInvites.filter((invite) => invite.id !== inviteId));
      } else {
        toast.error("Failed to deny group invite.");
      }
    } catch (error) {
      console.error("Error denying group invite:", error);
      toast.error("An error occurred while denying the group invite.");
    }
  };

  const displayGroups = () => {
    navigate("/groups");
  };

  return (
    <div className={`right-side-panel ${isVisible ? "visible" : ""}`}>
      <button className="close-btn" onClick={closePanel}>
        &times;
      </button>

      <div className="group-actions">
        {ownerGroups.length > 0 && (
          <div className="invite-user">
            <input
              type="text"
              placeholder="Enter user ID to invite"
              value={userIdToInvite}
              onChange={(e) => setUserIdToInvite(e.target.value)}
            />
            <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
              <option value="">Select a group</option>
              {ownerGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <button onClick={handleInvite}>Invite</button>
          </div>
        )}

        <button className="create-group-btn" onClick={displayGroups}>
          View groups
        </button>
      </div>

      <h2>Pending Group Invites</h2>
      <div className="pending-invites-list">
        {pendingInvites.length > 0 ? (
          pendingInvites.map((invite) => (
            <div key={invite.id} className="pending-invite">
              <span>
                {invite.groupName} (Invited by {invite.ownerName})
              </span>
              <button className="accept-invite-btn" onClick={() => acceptGroupInvite(invite.inviteId)}>
                Accept
              </button>
              <button className="decline-invite-btn" onClick={() => denyGroupInvite(invite.inviteId)}>
                Deny
              </button>
            </div>
          ))
        ) : (
          <p>No pending invites.</p>
        )}
      </div>
    </div>
  );
};

export default GroupsPanel;
