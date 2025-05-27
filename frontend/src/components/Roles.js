import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API_URL;

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchRoles();
    fetchGroups();
    // eslint-disable-next-line
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data.roles);
    } catch (error) {
      toast.error(error.response.data.message);
      // toast.error('Failed to fetch roles.');
      console.error('Error fetching roles:', error);
    }
  };


  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(response.data.groups || response.data);
    } catch (error) {
      toast.error(error.response.data.message);
      // toast.error('Failed to fetch groups.');
      console.error('Error fetching groups:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedRole) {
        await axios.put(`${API_URL}/roles/${selectedRole.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Role updated successfully!');
      } else {
        await axios.post(`${API_URL}/roles`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Role created successfully!');
      }
      setIsModalOpen(false);
      setSelectedRole(null);
      setFormData({ name: '', description: '' });
      fetchRoles();
    } catch (error) {
      toast.error(`Failed to ${selectedRole ? 'update' : 'add'} role.`);
      console.error('Error saving role:', error);
    }
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
    });
    setIsModalOpen(true);
  };

  // Open the delete modal
  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await axios.delete(`${API_URL}/roles/${roleToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Role deleted successfully!');
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
      fetchRoles();
    } catch (error) {
      toast.error(error.response.data.message);
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  const handleAssignToGroup = async (roleId, groupId) => {
    try {
      await axios.post(`${API_URL}/roles/groups/${groupId}`, { roleId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Role assigned to group!');
      fetchRoles();
      setIsGroupModalOpen(false);
    } catch (error) {
      toast.error(error.response.data.message);
      // toast.error('Failed to assign role to group.');
      console.error('Error assigning role to group:', error);
    }
  };

  const handleRemoveFromGroup = async (roleId, groupId) => {
    try {
      await axios.delete(`${API_URL}/roles/groups/${groupId}/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Role removed from group!');
      fetchRoles();
    } catch (error) {
      // toast.error('Failed to remove role from group.');
      toast.error(error.response.data.message);
    }
  };

  // Helper for permissions display
  const renderPermissions = (permissions) => {

    if (!permissions || permissions.length === 0) return null;
    const maxShow = 3;
    const shown = permissions.slice(0, maxShow);
    const remainder = permissions.length - maxShow;
    return (
      <>
        {shown.map((perm) => (
          <span
            key={perm.id}
            className="badge bg-light text-dark me-2 mb-2"
            style={{
              fontWeight: 500,
              fontSize: "0.95em",
              border: "1px solid #e6e8ee"
            }}
          >
            {perm.name}
          </span>
        ))}
        {remainder > 0 && (
          <span
            className="badge bg-light text-dark mb-2"
            style={{
              fontWeight: 500,
              fontSize: "0.95em",
              border: "1px solid #e6e8ee"
            }}
          >
            +{remainder} more
          </span>
        )}
      </>
    );
  };

  // Helper for group badges with remove button
  const renderGroups = (role) => {
    if (!role.groups || role.groups.length === 0) return null;
    return role.groups.map((g) => (
      <span
        key={g.id || g.name}
        className="badge bg-light text-dark me-2 mb-2"
        style={{
          fontWeight: 500,
          fontSize: "0.96em",
          border: "1px solid #e6e8ee",
          position: "relative"
        }}
      >
        {g.name}
        <button
          type="button"
          className="btn btn-link btn-sm p-0 ms-1"
          style={{ color: "#FF3B30", fontSize: "1rem", lineHeight: 1, textDecoration: 'none' }}
          title="Remove group"
          onClick={() => handleRemoveFromGroup(role.id, g.id)}
        >
          <span className="bi bi-x"></span>
        </button>
      </span>
    ));
  };

  // Groups not already assigned to the selected role
  const groupsNotInRole = selectedRole
    ? groups.filter(
      (g) => !selectedRole.groups?.some((rg) => rg.id === g.id)
    )
    : [];

  return (
    <div className="container-fluid px-4 py-4" style={{ background: "#fff", minHeight: "100vh" }}>
      {/* <ToastContainer position="top-right" autoClose={3500} /> */}
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold" style={{ fontSize: "2rem" }}>Roles Management</h2>
          <div className="text-muted" style={{ fontSize: "1.08rem" }}>
            Manage roles and their permissions
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
            setSelectedRole(null);
            setFormData({ name: '', description: '' });
            setIsModalOpen(true);
          }}
        >
          <span className="bi bi-plus-lg me-2"></span>
          Create Role
        </button>
      </div>

      {/* Role Cards */}
      <div className="row mb-4">
        {roles.map((role) => (
          <div key={role.id} className="col-md-4 mb-3">
            <div
              className="p-3 h-100"
              style={{
                border: "1px solid #e6e8ee",
                borderRadius: 12,
                background: "#fff",
                minHeight: 180,
                boxShadow: "0 1px 2px rgba(20,20,40,0.03)"
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h5 className="fw-semibold mb-0">{role.name}</h5>
                <div>
                  <span
                    className="bi bi-pencil-square me-2"
                    role="button"
                    style={{ fontSize: "1.2rem", color: "#222" }}
                    title="Edit"
                    onClick={() => handleEdit(role)}
                  ></span>
                  <span
                    className="bi bi-trash me-2"
                    role="button"
                    style={{ fontSize: "1.2rem", color: "#FF3B30" }}
                    title="Delete"
                    onClick={() => handleDeleteClick(role)}
                  ></span>
                  <span
                    className="bi bi-person-plus"
                    role="button"
                    style={{ fontSize: "1.2rem", color: "#2060E8" }}
                    title="Assign Group"
                    onClick={() => {
                      setSelectedRole(role);
                      setIsGroupModalOpen(true);
                    }}
                  ></span>
                </div>
              </div>
              <div className="mb-2 text-muted" style={{ minHeight: 38 }}>{role.description}</div>
              <div style={{ fontWeight: 500, fontSize: "0.99em" }}>
                Permissions <span className="text-muted">({role.permissions?.length || 0})</span>
              </div>
              <div className="mb-2 mt-1" style={{ minHeight: 32 }}>
                {renderPermissions(role.permissions || [])}
              </div>
              <div style={{ fontWeight: 500, fontSize: "0.99em" }}>
                <span className="bi bi-people me-1"></span>Groups <span className="text-muted">({role.groups?.length || 0})</span>
              </div>
              <div className="mt-1">
                {renderGroups(role)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Roles Overview Table */}
      <div
        className="p-4 mb-3"
        style={{
          background: "#fff",
          border: "1px solid #e6e8ee",
          borderRadius: 10,
          boxShadow: "0 1px 2px rgba(20,20,40,0.03)"
        }}
      >
        <h4 className="fw-bold mb-3">Roles Overview</h4>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Role Name</th>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Description</th>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Permissions</th>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Assigned Groups</th>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted py-4" style={{ textAlign: "center" }}>
                    No roles found
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id}>
                    <td className="fw-semibold">{role.name}</td>
                    <td>{role.description}</td>
                    <td>{role.permissions?.length || 0}</td>
                    <td>
                      {renderGroups(role)}
                    </td>
                    <td>
                      <span
                        className="bi bi-pencil-square me-3"
                        role="button"
                        style={{ fontSize: "1.15rem", color: "#222" }}
                        title="Edit"
                        onClick={() => handleEdit(role)}
                      ></span>
                      <span
                        className="bi bi-trash"
                        role="button"
                        style={{ fontSize: "1.15rem", color: "#FF3B30" }}
                        title="Delete"
                        onClick={() => handleDeleteClick(role)}
                      ></span>
                      <span
                        className="bi bi-person-plus ms-3"
                        role="button"
                        style={{ fontSize: "1.15rem", color: "#2060E8" }}
                        title="Assign Group"
                        onClick={() => {
                          setSelectedRole(role);
                          setIsGroupModalOpen(true);
                        }}
                      ></span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Modal */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {selectedRole ? 'Edit Role' : 'Add New Role'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsModalOpen(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {selectedRole ? 'Update' : 'Create'}
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
      )}

      {/* Assign to Group Modal */}
      {isGroupModalOpen && selectedRole && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Role to Group</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsGroupModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                {groupsNotInRole.length === 0 ? (
                  <div className="text-muted">All groups already have this role.</div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {groupsNotInRole.map((group) => (
                      <li
                        key={group.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span>{group.name}</span>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleAssignToGroup(selectedRole.id, group.id)}
                        >
                          Assign
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsGroupModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && roleToDelete && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Role</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelDelete}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the role{' '}
                  <strong>{roleToDelete.name}</strong>?
                  <br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bootstrap Icons CDN (add to your public/index.html if not already) */}
      {/* 
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
      */}
    </div>
  );
};

export default Roles;
