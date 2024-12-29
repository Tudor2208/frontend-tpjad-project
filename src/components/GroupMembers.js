import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import '../css/GroupMembers.css';

const GroupMembers = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [owner, setOwner] = useState("");  
  const [isMembersLoading, setIsMembersLoading] = useState(true); 
  const [isEditing, setIsEditing] = useState(false); 
  const [newGroupName, setNewGroupName] = useState(""); 
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser?.id;
  const token = storedUser?.token;

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!userId || !token) {
        toast.error('User not logged in');
        navigate('/');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8081/api/v1/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setGroup(data);
          fetchOwnerDetails(data.ownerId, token);
          fetchGroupMembers(data.membersIds, token);
        } else {
          toast.error('Failed to fetch group details');
        }
      } catch (error) {
        console.error('Error fetching group details:', error);
        toast.error('Error fetching group details');
      }
    };

    fetchGroupDetails();
  }, [groupId, userId, token, navigate]);

  const fetchOwnerDetails = async (ownerId, token) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/users/${ownerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const ownerData = await response.json();
        setOwner(`${ownerData.firstName} ${ownerData.lastName}`);
      } else {
        toast.error('Failed to fetch owner details');
      }
    } catch (error) {
      console.error('Error fetching owner details:', error);
      toast.error('Error fetching owner details');
    }
  };

  const fetchGroupMembers = async (memberIds, token) => {
    if (memberIds.length === 0) {
      setIsMembersLoading(false);
      return;
    }

    try {
      const memberPromises = memberIds.map(memberId =>
        fetch(`http://localhost:8080/api/v1/users/${memberId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then(response => response.json())
      );

      const membersData = await Promise.all(memberPromises);
      setMembers(membersData);
      setIsMembersLoading(false); 
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast.error('Error fetching group members');
      setIsMembersLoading(false); 
    }
  };

  const handleEditGroupName = async () => {
    if (!newGroupName) {
      toast.error('Please enter a valid group name');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/v1/groups/${groupId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newGroupName }),
      });

      if (response.ok) {
        toast.success('Group name updated successfully');
        const updatedGroup = await response.json();
        setGroup(updatedGroup);
        setIsEditing(false);
      } else {
        toast.error('Failed to update group name');
      }
    } catch (error) {
      toast.error('Error updating group name');
    }
  };

  const removeMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        const response = await fetch(`http://localhost:8081/api/v1/groups/${groupId}/remove-member?userId=${userId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          setMembers(members.filter(member => member.id !== memberId));
          toast.success('Member removed successfully');
        } else {
          toast.error('Failed to remove member');
        }
      } catch (error) {
        toast.error('Error removing member');
      }
    }
  };

  return (
    <div className="group-detail-container">
      {group ? (
        <>
          <h1>
            {isEditing ? (
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter new group name"
              />
            ) : (
              group.name
            )}
            {group.ownerId === userId && !isEditing && (
              <i className="fa-solid fa-edit" onClick={() => setIsEditing(true)} />
            )}
            {isEditing && (
              <button onClick={handleEditGroupName} style={{ marginLeft: '10px' }}>
                Save
              </button>
            )}
          </h1>
          <p>Owner: {owner || 'Loading owner details...'}</p>
          <h2>Members</h2>
          {isMembersLoading ? (
            <p>Loading members...</p>
          ) : members.length === 0 ? (
            <p>No members found</p>
          ) : (
            <ul className="members-list">
              {members.map((member) => (
                <li key={member.id} className="member-item">
                  <p>{`${member.firstName} ${member.lastName}`}</p>
                  {group.ownerId === userId && (
                    <button onClick={() => removeMember(member.id)}>Remove</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p>Loading group details...</p>
      )}
    </div>
  );
};

export default GroupMembers;
