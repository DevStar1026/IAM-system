import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaUserPlus, FaTrash, FaEdit } from "react-icons/fa";
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API_URL;

// Example actions; replace with API fetch if needed
const ACTIONS = [
  { value: 'read', label: 'Read' },
  { value: 'create', label: 'create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
];

// Action style mapping for colors
const ACTION_STYLES = {
  read: { color: "#2f80ed", bg: "#e6f0fa" },
  create: { color: "#3bb77e", bg: "#e6f6ec" },
  update: { color: "#b99a34", bg: "#fff7e6" },
  delete: { color: "#e34d4d", bg: "#fae6e6" },
  export: { color: "#8e44ad", bg: "#f6e6fa" }
};

// Helper: group permissions by module
function groupPermissionsByModule(permissions, modules) {
  const moduleMap = {};
  modules.forEach(mod => {
    moduleMap[mod.id] = { ...mod, permissions: [] };
  });
  permissions.forEach(perm => {
    const modId = perm.module?.id || perm.module_id;
    if (moduleMap[modId]) {
      moduleMap[modId].permissions.push(perm);
    }
  });
  // Only return modules with at least one permission, sorted by module name
  return Object.values(moduleMap)
    .filter(m => m.permissions.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    action: '',
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState(null);

  // For role assignment modal
  const [assignRoleModalOpen, setAssignRoleModalOpen] = useState(false);
  const [permissionToAssign, setPermissionToAssign] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  // For edit permission
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [permissionToEdit, setPermissionToEdit] = useState(null);

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchPermissions();
    fetchRoles();
    fetchModules();
    // eslint-disable-next-line
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${API_URL}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPermissions(response.data.permissions);
    } catch (error) {
      toast.error('Failed to fetch permissions.', {
        position: "top-right",
        autoClose: 3500,
      });
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data.roles);
    } catch (error) {
      toast.error('Failed to fetch roles.', {
        position: "top-right",
        autoClose: 3500,
      });
      console.error('Error fetching roles:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await axios.get(`${API_URL}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModules(response.data.modules);
    } catch (error) {
      toast.error('Failed to fetch modules.', {
        position: "top-right",
        autoClose: 3500,
      });
      console.error('Error fetching modules:', error);
    }
  };

  // Create new permission (module + action)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/permissions/`,
        {
          name: formData.name,
          description: formData.description,
          moduleId: selectedModuleId,
          action: formData.action,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsModalOpen(false);
      setFormData({ name: '', description: '', action: '' });
      setSelectedModuleId('');
      fetchPermissions();
      toast.success('Permission created successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        'Failed to create permission. Please try again.';
      toast.error(`Add failed: ${errorMsg}`, {
        position: 'top-right',
        autoClose: 3500,
      });
    }
  };

  // Edit permission logic
  const handleEditClick = (permission) => {
    setPermissionToEdit(permission);
    setFormData({
      name: permission.name,
      description: permission.description,
      action: permission.action,
    });
    setSelectedModuleId(permission.module?.id || permission.module_id || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!permissionToEdit) return;
    try {
      await axios.put(
        `${API_URL}/permissions/${permissionToEdit.id}`,
        {
          name: formData.name,
          description: formData.description,
          moduleId: selectedModuleId,
          action: formData.action,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditModalOpen(false);
      setPermissionToEdit(null);
      setFormData({ name: '', description: '', action: '' });
      setSelectedModuleId('');
      fetchPermissions();
      toast.success('Permission updated successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        'Failed to update permission. Please try again.';
      toast.error(`Update failed: ${errorMsg}`, {
        position: 'top-right',
        autoClose: 3500,
      });
    }
  };

  // Modal logic for delete confirmation
  const handleDeleteClick = (permission) => {
    setPermissionToDelete(permission);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!permissionToDelete) return;
    try {
      await axios.delete(`${API_URL}/permissions/${permissionToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsDeleteModalOpen(false);
      setPermissionToDelete(null);
      fetchPermissions();
      toast.success('Permission deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        'Failed to delete permission. Please try again.';
      toast.error(`Delete failed: ${errorMsg}`, {
        position: 'top-right',
        autoClose: 3500,
      });
      setIsDeleteModalOpen(false);
      setPermissionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPermissionToDelete(null);
  };

  // Assign roles to permission
  const handleAssignRoles = (permission) => {
    setPermissionToAssign(permission);
    setSelectedRoleIds(permission.roles ? permission.roles.map((r) => r.id) : []);
    setAssignRoleModalOpen(true);
  };

  const handleAssignRolesSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/permissions/roles/${permissionToAssign.id}`,
        { roleIds: selectedRoleIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Roles assigned successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      setAssignRoleModalOpen(false);
      setPermissionToAssign(null);
      fetchPermissions();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        'Failed to assign roles. Please try again.';
      toast.error(`Assign roles failed: ${errorMsg}`, {
        position: 'top-right',
        autoClose: 3500,
      });
    }
  };

  // Group permissions by module for display
  const groupedModules = groupPermissionsByModule(permissions, modules);

  return (
    <div className="container-fluid px-4 py-4" style={{ background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3">Permissions Management</h1>
          <p className="text-muted small">Manage permissions and assign them to roles</p>
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
            setFormData({ name: '', description: '', action: '' });
            setSelectedModuleId('');
            setIsModalOpen(true);
          }}
        >
          <span style={{ fontSize: '1.2em', marginRight: 8, fontWeight: 600 }}>+</span>
          Create Permission
        </button>
      </div>

      {/* Table of all permissions */}
      <div className="card mb-4 mt-4 shadow-sm">
        <div className="card-body pb-0">
          <h5 className="fw-bold mb-3">All Permissions</h5>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Module</th>
                  <th>Action</th>
                  <th>Description</th>
                  <th>Assigned Roles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => {
                  const actionStyle = ACTION_STYLES[permission.action] || { color: "#333", bg: "#eee" };
                  return (
                    <tr key={permission.id}>
                      <td className="fw-semibold">{permission.name}</td>
                      <td>{permission.module?.name || permission.module_name}</td>
                      <td>
                        <span
                          style={{
                            background: actionStyle.bg,
                            color: actionStyle.color,
                            fontWeight: 600,
                            borderRadius: 12,
                            padding: "5px 14px",
                            fontSize: 13,
                            textTransform: "capitalize"
                          }}
                        >
                          {permission.action}
                        </span>
                      </td>
                      <td>{permission.description}</td>
                      <td>
                        {permission.roles && permission.roles.length > 0
                          ? permission.roles.length
                          : 0}
                      </td>
                      <td>
                        <button
                          className="btn btn-link p-0 me-2"
                          title="Edit"
                          onClick={() => handleEditClick(permission)}
                        >
                          <FaEdit color="#b99a34" size={16} />
                        </button>
                        <button
                          className="btn btn-link p-0 me-2"
                          title="Assign Roles"
                          onClick={() => handleAssignRoles(permission)}
                        >
                          <FaUserPlus color="#2f80ed" size={16} />
                        </button>
                        <button
                          className="btn btn-link p-0"
                          title="Delete"
                          onClick={() => handleDeleteClick(permission)}
                        >
                          <FaTrash color="#e34d4d" size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grouped Permissions Cards by Module */}
      {groupedModules.map(module => (
        <div key={module.id} className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-shield-check" style={{ fontSize: 20, color: "#2060E8", marginRight: 8 }} />
            <h4 className="fw-bold mb-0">{module.name} Permissions</h4>
            <span className="badge bg-light text-dark ms-2" style={{ fontSize: 15, fontWeight: 500 }}>
              {module.permissions.length}
            </span>
          </div>
          <div className="row g-3">
            {module.permissions.map(permission => {
              const actionStyle = ACTION_STYLES[permission.action] || { color: "#333", bg: "#eee" };
              return (
                <div key={permission.id} className="col-md-6 col-lg-4">
                  <div
                    className="card h-100 shadow-sm"
                    style={{
                      borderLeft: `4px solid ${actionStyle.color}`,
                      borderRadius: 14,
                      overflow: "hidden"
                    }}
                  >
                    <div className="card-body pb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{permission.name}</h5>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-link p-0"
                            title="Edit"
                            onClick={() => handleEditClick(permission)}
                          >
                            <FaEdit color="#b99a34" size={18} />
                          </button>
                          <button
                            className="btn btn-link p-0"
                            title="Assign Roles"
                            onClick={() => handleAssignRoles(permission)}
                          >
                            <FaUserPlus color="#2f80ed" size={18} />
                          </button>
                          <button
                            className="btn btn-link p-0"
                            title="Delete"
                            onClick={() => handleDeleteClick(permission)}
                          >
                            <FaTrash color="#e34d4d" size={18} />
                          </button>
                        </div>
                      </div>
                      {permission.description && (
                        <p className="mb-1 text-muted">{permission.description}</p>
                      )}
                      {permission.action && (
                        <span
                          className="badge mb-2"
                          style={{
                            background: actionStyle.bg,
                            color: actionStyle.color,
                            fontWeight: 600,
                            borderRadius: 12,
                            padding: "5px 14px",
                            fontSize: 13,
                            textTransform: "capitalize"
                          }}
                        >
                          {permission.action}
                        </span>
                      )}
                      {permission.roles && permission.roles.length > 0 && (
                        <div className="mt-1">
                          <small className="text-muted">Assigned Roles:</small>
                          <div className="mt-1 d-flex flex-wrap gap-1">
                            {permission.roles.map((role) => (
                              <span
                                key={role.id}
                                className="badge"
                                style={{
                                  background: "#f5f7fa",
                                  color: "#222",
                                  borderRadius: 14,
                                  padding: "4px 12px",
                                  fontSize: 13,
                                  fontWeight: 500,
                                  border: "1px solid #e1e7f0"
                                }}
                              >
                                {role.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* (Modals remain unchanged) */}
      {/* ...[keep your Create, Edit, Assign Roles, and Delete modals here as before]... */}

      {/* Create Permission Modal */}
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "12px" }}>
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Create New Permission</h5>
                  <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Permission Name</label>
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
                  <div className="mb-3">
                    <label className="form-label">Module</label>
                    <select
                      className="form-select"
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                      required
                    >
                      <option value="">Select a module</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Action</label>
                    <select
                      className="form-select"
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                      required
                    >
                      <option value="">Select an action</option>
                      {ACTIONS.map((action) => (
                        <option key={action.value} value={action.value}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      background: "#13182c",
                      color: "#fff",
                      fontWeight: 600,
                      borderRadius: 6,
                      minWidth: 90,
                    }}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permission Modal */}
      {isEditModalOpen && permissionToEdit && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "12px" }}>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Edit Permission</h5>
                  <button type="button" className="btn-close" onClick={() => setIsEditModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Permission Name</label>
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
                  <div className="mb-3">
                    <label className="form-label">Module</label>
                    <select
                      className="form-select"
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                      required
                    >
                      <option value="">Select a module</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Action</label>
                    <select
                      className="form-select"
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                      required
                    >
                      <option value="">Select an action</option>
                      {ACTIONS.map((action) => (
                        <option key={action.value} value={action.value}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      background: "#b99a34",
                      color: "#fff",
                      fontWeight: 600,
                      borderRadius: 6,
                      minWidth: 90,
                    }}
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Roles Modal */}
      {assignRoleModalOpen && permissionToAssign && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "12px" }}>
              <form onSubmit={handleAssignRolesSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Assign Roles</h5>
                  <button type="button" className="btn-close" onClick={() => setAssignRoleModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">Select Roles</label>
                  <select
                    className="form-select"
                    multiple
                    value={selectedRoleIds}
                    onChange={e => {
                      const options = Array.from(e.target.selectedOptions);
                      setSelectedRoleIds(options.map(o => o.value));
                    }}
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  <small className="text-muted">Hold Ctrl (Windows) or Cmd (Mac) to select multiple roles.</small>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setAssignRoleModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Assign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && permissionToDelete && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Permission</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelDelete}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the permission{' '}
                  <strong>{permissionToDelete.name}</strong>?
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
    </div>
  );
};

export default Permissions;