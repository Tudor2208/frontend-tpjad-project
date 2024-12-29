import React, { useState, useEffect } from "react";
import { toast } from "sonner"; 
import '../css/Groups.css'; 
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [members, setMembers] = useState({}); 
  const [owners, setOwners] = useState({}); 
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;
  const token = storedUser?.token;

  useEffect(() => {
    const fetchGroups = async () => {
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
          setGroups(data);

          data.forEach(group => {
            fetchGroupMembers(group.membersIds, token, group.id);
            fetchGroupOwner(group.ownerId, token, group.id);
          });
        } else {
          console.error("Error fetching groups:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, [userId, token]);

  const fetchGroupMembers = async (memberIds, token, groupId) => {
    try {
      const memberPromises = memberIds.map(memberId =>
        fetch(`http://localhost:8080/api/v1/users/${memberId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then(response => response.json())
      );

      const membersData = await Promise.all(memberPromises);
      const memberNames = membersData.map(member => `${member.firstName} ${member.lastName}`);

      setMembers(prevMembers => ({
        ...prevMembers,
        [groupId]: memberNames,
      }));
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };

  const fetchGroupOwner = async (ownerId, token, groupId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/users/${ownerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const ownerData = await response.json();
        setOwners(prevOwners => ({
          ...prevOwners,
          [groupId]: `${ownerData.firstName} ${ownerData.lastName}`,
        }));
      } else {
        console.error("Error fetching group owner:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching group owner:", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || !userId || !token) {
      toast.error("Please provide a group name.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/v1/groups", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGroupName,
          ownerId: userId,
        }),
      });

      if (!response.ok) {
        toast.error(`Failed to create group. Status: ${response.status}`);
        return;
      }

      toast.success("Group created successfully!");
      setNewGroupName("");
      setIsCreateGroupOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("An error occurred while creating the group.");
    }
  };

  const leaveGroup = async (groupId) => {
    if (!userId || !token) {
      toast.error("User not logged in.");
      return;
    }

    const confirmation = window.confirm("Are you sure you want to leave this group?");
    if (!confirmation) return;

    try {
      const response = await fetch(`http://localhost:8081/api/v1/groups/${groupId}/remove-member?userId=${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("You left the group.");
        setGroups(groups.filter((group) => group.id !== groupId));
        navigate("/groups")
      } else {
        toast.error("Failed to leave group.");
      }
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error("An error occurred while leaving the group.");
    }
  };

  const deleteGroup = async (groupId) => {
    if (!token) {
      toast.error("User not logged in.");
      return;
    }

    const confirmation = window.confirm("Are you sure you want to delete this group?");
    if (!confirmation) return;

    try {
      const response = await fetch(`http://localhost:8081/api/v1/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Group deleted successfully.");
        setGroups(groups.filter((group) => group.id !== groupId));
        navigate("/groups")
      } else {
        toast.error("Failed to delete group.");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("An error occurred while deleting the group.");
    }
  };

  const handleGroupClick = (groupId) => {
    navigate("/group/" + groupId)
  }

  return (
    <div className="groups-container">
      <h1>Your Groups</h1>

      <div className="search-group">
        <input
          type="text"
          placeholder="Search for a group..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      <div className="groups-list">
        {groups
          .filter(group => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(group => (
            <div key={group.id} className="group-item" onClick={() => handleGroupClick(group.id)}>
              <h3>{group.name}</h3>
              <p>Owner: {group.ownerId === userId ? "YOU" : owners[group.id] || "Loading..."}</p> 
              <p>Members ({members[group.id]?.length || 0}): {members[group.id]?.join(", ") || "Loading..."}</p>
              <div>
                {group.ownerId === userId ? (
                  <button className="delete-btn" onClick={() => deleteGroup(group.id)}>Delete</button>
                ) : (
                  <button className="leave-btn" onClick={() => leaveGroup(group.id)}>Leave</button>
                )}
              </div>
            </div>
          ))}
        {groups.length === 0 && <p>No groups found.</p>}
      </div>

      <button className="create-group-btn" onClick={() => setIsCreateGroupOpen(true)}>
        Create group
      </button>

      {isCreateGroupOpen && (
        <div className="create-group-form">
          <input
            type="text"
            placeholder="Enter group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button onClick={handleCreateGroup}>Create</button>
          <button onClick={() => setIsCreateGroupOpen(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Groups;
