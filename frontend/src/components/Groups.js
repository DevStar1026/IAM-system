import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API_URL;

// Utility: Add users to each group based on user.groups
function assignUsersToGroups(groups, users) {
  return groups.map(group => {
    const groupUsers = users.filter(
      user => Array.isArray(user.groups) && user.groups.includes(group.name)
    );
    return { ...group, users: groupUsers };
  });
}

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { token } = useSelector((state) => state.auth);

  // Fetch both groups and users, then assign users to groups
  const fetchGroupsAndUsers = async () => {
    try {
      const [groupsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/groups`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const groupsArr = groupsRes.data.groups;
      const usersArr = usersRes.data.users || usersRes.data;
      setUsers(usersArr);
      setGroups(assignUsersToGroups(groupsArr, usersArr));
    } catch (error) {
      toast.error('Error fetching groups or users');
      console.error('Error fetching groups or users:', error);
    }
  };

  useEffect(() => {
    fetchGroupsAndUsers();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedGroup) {
        await axios.put(`${API_URL}/groups/${selectedGroup.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Group updated successfully!');
      } else {
        await axios.post(`${API_URL}/groups`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Group created successfully!');
      }
      setIsModalOpen(false);
      setSelectedGroup(null);
      setFormData({ name: '', description: '' });
      fetchGroupsAndUsers();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error saving group';
      toast.error(msg);
      console.error('Error saving group:', error);
    }
  };

  const handleEdit = (group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
    });
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (group) => {
    setGroupToDelete(group);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    try {
      await axios.delete(`${API_URL}/groups/${groupToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Group deleted successfully!');
      setIsDeleteModalOpen(false);
      setGroupToDelete(null);
      fetchGroupsAndUsers();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error deleting group';
      toast.error(msg);
      setIsDeleteModalOpen(false);
      setGroupToDelete(null);
      console.error('Error deleting group:', error);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setGroupToDelete(null);
  };

  const handleAddUser = async (groupId, userId) => {
    try {
      await axios.post(`${API_URL}/groups/${groupId}/users`, { userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User added to group!');
      fetchGroupsAndUsers();
      setIsUserModalOpen(false);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error adding user to group';
      toast.error(msg);
      console.error('Error adding user to group:', error);
    }
  };

  const handleRemoveUser = async (groupId, userId) => {
    try {
      await axios.delete(`${API_URL}/groups/${groupId}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User removed from group!');
      fetchGroupsAndUsers();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error removing user from group';
      toast.error(msg);
      console.error('Error removing user from group:', error);
    }
  };

  // Helper: format created date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  // Users not in selected group
  const usersNotInGroup = selectedGroup
    ? users.filter(u =>
      !u.groups || !u.groups.includes(selectedGroup.name)
    )
    : [];

  return (
    <div className="container-fluid px-4 py-4" style={{ background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div className="d-flex align-items-center mb-1">
            <span className="bi bi-people" style={{ fontSize: "2rem", marginRight: 10, color: "#222" }}></span>
            <h2 className="fw-bold mb-0" style={{ fontSize: "2rem" }}>Groups</h2>
          </div>
          <div className="text-muted" style={{ fontSize: "1.08rem" }}>
            Manage user groups and assignments
          </div>
        </div>
        <button
          className="btn"
          style={{
            background: "#0d112b",
            color: "#fff",
            fontWeight: 600,
            borderRadius: 8,
            padding: "8px 24px",
            fontSize: "1rem",
            boxShadow: "0 1px 2px rgba(20,20,40,0.05)"
          }}
          onClick={() => {
            setSelectedGroup(null);
            setFormData({ name: '', description: '' });
            setIsModalOpen(true);
          }}
        >
          <span className="bi bi-plus-lg me-2"></span>
          Add Group
        </button>
      </div>

      {/* Card Table */}
      <div
        className="p-4 mb-3"
        style={{
          background: "#fff",
          border: "1px solid #e6e8ee",
          borderRadius: 10,
          boxShadow: "0 1px 2px rgba(20,20,40,0.03)"
        }}
      >
        <div className="mb-2">
          <h5 className="fw-bold mb-0" style={{ fontSize: "1.25rem" }}>All Groups</h5>
          <div className="text-muted" style={{ fontSize: "1rem" }}>
            View and manage all groups in the system
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Name</th>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Description</th>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Users</th>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Roles</th>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Created</th>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted py-4" style={{ textAlign: "center" }}>
                    No groups found
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.id}>
                    <td>{group.name}</td>
                    <td>{group.description || '--'}</td>
                    <td>
                      {group.users && group.users.length > 0
                        ? group.users.map((u) => (
                          <span key={u.id} className="badge bg-light text-dark me-1 mb-1" style={{ fontWeight: 500 }}>
                            {u.username}
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 ms-1"
                              style={{ color: "#FF3B30", fontSize: "1rem", lineHeight: 1 }}
                              title="Remove user"
                              onClick={() => handleRemoveUser(group.id, u.id)}
                            >
                              <span className="bi bi-x"></span>
                            </button>
                          </span>
                        ))
                        : '--'}
                    </td>
                    <td>
                      {group.roles && group.roles.length > 0
                        ? group.roles.map((r) => r.name).join(', ')
                        : '--'}
                    </td>
                    <td>{formatDate(group.created_at || group.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-light border me-2"
                        onClick={() => {
                          setSelectedGroup(group);
                          setIsUserModalOpen(true);
                        }}
                        style={{ color: "#2060E8", fontWeight: 500 }}
                        title="Add User"
                      >
                        <span className="bi bi-person-plus me-1"></span>Add User
                      </button>
                      <button
                        className="btn btn-sm btn-light border me-2"
                        onClick={() => handleEdit(group)}
                        style={{ color: "#2060E8", fontWeight: 500 }}
                        title="Edit"
                      >
                        <span className="bi bi-pencil me-1"></span>Edit
                      </button>
                      <button
                        className="btn btn-sm btn-light border"
                        onClick={() => handleDeleteClick(group)}
                        style={{ color: "#FF3B30", fontWeight: 500 }}
                        title="Delete"
                      >
                        <span className="bi bi-trash me-1"></span>Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Group Modal */}
      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.25)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{selectedGroup ? 'Edit Group' : 'Add Group'}</h5>
                  <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      className="form-control"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedGroup ? 'Save Changes' : 'Create Group'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isUserModalOpen && selectedGroup && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.25)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add User to {selectedGroup.name}</h5>
                <button type="button" className="btn-close" onClick={() => setIsUserModalOpen(false)} />
              </div>
              <div className="modal-body">
                {usersNotInGroup.length === 0 ? (
                  <div className="text-muted">All users are already in this group.</div>
                ) : (
                  <ul className="list-group">
                    {usersNotInGroup.map(user => (
                      <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{user.username}</span>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleAddUser(selectedGroup.id, user.id)}
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setIsUserModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && groupToDelete && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.25)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Group</h5>
                <button type="button" className="btn-close" onClick={handleCancelDelete} />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the group <b>{groupToDelete.name}</b>?
                  <br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancelDelete}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
