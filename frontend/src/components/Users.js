import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API_URL;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    await axios
      .get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setUsers(response.data.users))
      .catch((error) => {
        const message =
          error.response?.data?.message || error.message || 'Error fetching users';
        toast.error(message);
      });
  };

  // Handle form submission for adding/editing users
  // This function handles both adding a new user and editing an existing user
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await axios.put(
          `${API_URL}/users/${selectedUser.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('User updated successfully!');
      } else {
        await axios.post(`${API_URL}/users`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('User created successfully!');
      }
      setIsModalOpen(false);
      setSelectedUser(null);
      setFormData({ username: '', email: '', password: '' });
      fetchUsers();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Error saving user';
      toast.error(message);
    }
  };

  // Open modal for adding/editing user
  // If user is provided, it will pre-fill the form for editing
  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
    });
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`${API_URL}/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User deleted successfully!');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Error deleting user';
      toast.error(message);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // Helper: format created date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="container-fluid px-4 py-4" style={{ background: "#fff", minHeight: "100vh" }}>
      {/* <ToastContainer position="top-right" autoClose={3500} /> */}
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div className="d-flex align-items-center mb-1">
            <span className="bi bi-people" style={{ fontSize: "2rem", marginRight: 10, color: "#222" }}></span>
            <h2 className="fw-bold mb-0" style={{ fontSize: "2rem" }}>Users</h2>
          </div>
          <div className="text-muted" style={{ fontSize: "1.08rem" }}>
            Manage system users and their access
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
            setSelectedUser(null);
            setFormData({ username: '', email: '', password: '' });
            setIsModalOpen(true);
          }}
        >
          <span className="bi bi-plus-lg me-2"></span>
          Add User
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
          <h5 className="fw-bold mb-0" style={{ fontSize: "1.25rem" }}>All Users</h5>
          <div className="text-muted" style={{ fontSize: "1rem" }}>
            View and manage all users in the system
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Name</th>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Email</th>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Groups</th>
                {/* <th className="fw-semibold" style={{ color: "#48506b" }}>Created</th> */}
                <th className="fw-semibold" style={{ color: "#48506b" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted py-4" style={{ textAlign: "center" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      {/* Render group names if available */}
                      {user.groups && user.groups.length > 0
                        ? user.groups.join(', ')
                        : '--'}
                    </td>
                    {/* <td>{formatDate(user.created_at || user.created_at)}</td> */}
                    <td>
                      <button
                        className="btn btn-sm btn-light border me-2"
                        onClick={() => handleEdit(user)}
                        style={{ color: "#2060E8", fontWeight: 500 }}
                      >
                        <span className="bi bi-pencil me-1"></span>Edit
                      </button>
                      <button
                        className="btn btn-sm btn-light border"
                        onClick={() => handleDeleteClick(user)}
                        style={{ color: "#FF3B30", fontWeight: 500 }}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.15)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedUser ? 'Edit User' : 'Add New User'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={!selectedUser}
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-primary">
                      {selectedUser ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.15)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={handleCancelDelete}></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete user{' '}
                  <span className="fw-semibold">{userToDelete?.username}</span>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bootstrap Icons CDN (add this to your public/index.html if not already) */}
      {/* 
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
      */}
    </div>
  );
};

export default Users;
