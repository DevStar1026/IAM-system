import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API_URL;

// Icon map for modules (update as needed)
const moduleIcons = {
  Users: "bi-person-vcard",
  Groups: "bi-people",
  Roles: "bi-shield-lock",
  Permissions: "bi-key",
  Reports: "bi-database",
  Settings: "bi-gear",
};

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchModules();
    // eslint-disable-next-line
  }, []);

  const fetchModules = async () => {
    try {
      const response = await axios.get(`${API_URL}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModules(response.data.modules);
    } catch (error) {
      toast.error(error.resonse.data.error || 'Failed to fetch modules.', {
        position: "top-right",
        autoClose: 3500,
      });
      console.error('Error fetching modules:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedModule) {
        await axios.put(
          `${API_URL}/modules/${selectedModule.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Module updated successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await axios.post(`${API_URL}/modules`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Module created successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
      }
      setIsModalOpen(false);
      setSelectedModule(null);
      setFormData({ name: '', description: '' });
      fetchModules();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error saving module.';
      toast.error(selectedModule ? `Update failed: ${errorMsg}` : `Create failed: ${errorMsg}`, {
        position: "top-right",
        autoClose: 3500,
      });
      console.error('Error saving module:', error);
    }
  };

  const handleEdit = (module) => {
    setSelectedModule(module);
    setFormData({ name: module.name, description: module.description || '' });
    setIsModalOpen(true);
  };

  // Open confirmation modal for delete
  const handleDeleteClick = (module) => {
    setModuleToDelete(module);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!moduleToDelete) return;
    try {
      await axios.delete(`${API_URL}/modules/${moduleToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Module deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      setIsDeleteModalOpen(false);
      setModuleToDelete(null);
      fetchModules();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error deleting module.';
      toast.error(`Delete failed: ${errorMsg}`, {
        position: "top-right",
        autoClose: 3500,
      });
      setIsDeleteModalOpen(false);
      setModuleToDelete(null);
      console.error('Error deleting module:', error);
    }
  };

  // Cancel delete action
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setModuleToDelete(null);
  };

  // Status toggle logic
  const handleStatusToggle = async (module) => {
    const updatedStatus = module.status === "Active" ? "Inactive" : "Active";
    try {
      await axios.patch(
        `${API_URL}/modules/${module.id}`,
        { status: updatedStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(
        `Module ${updatedStatus === "Active" ? 'enabled' : 'disabled'} successfully!`,
        { position: "top-right", autoClose: 3000 }
      );
      fetchModules();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error updating module status.';
      toast.error(`Status update failed: ${errorMsg}`, {
        position: "top-right",
        autoClose: 3500,
      });
      console.error('Error updating status:', error);
    }
  };

  // Permission badges
  const renderPermissions = (permissions) => {
    if (!permissions) return null;
    const maxShow = 3;
    const shown = permissions.slice(0, maxShow);
    const remainder = permissions.length - maxShow;
    return (
      <>
        {shown.map((perm, idx) => (
          <span
            key={perm}
            className="badge bg-light text-dark me-2 mb-2"
            style={{
              fontWeight: 500,
              fontSize: "0.97em",
              border: "1px solid #e6e8ee"
            }}
          >
            {perm}
          </span>
        ))}
        {remainder > 0 && (
          <span
            className="badge bg-light text-dark mb-2"
            style={{
              fontWeight: 500,
              fontSize: "0.97em",
              border: "1px solid #e6e8ee"
            }}
          >
            +{remainder} more
          </span>
        )}
      </>
    );
  };

  // Status badge
  const statusBadge = (status) => (
    <span
      className={`badge ${status === "Active" ? "bg-dark text-white" : "bg-light text-dark"}`}
      style={{
        fontWeight: 600,
        fontSize: "1em",
        borderRadius: 8,
        padding: "6px 16px",
        marginRight: 10
      }}
    >
      {status}
    </span>
  );

  return (
    <div className="container-fluid px-4 py-4" style={{ background: "#fff", minHeight: "100vh" }}>

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold" style={{ fontSize: "2rem" }}>Modules Management</h2>
          <div className="text-muted" style={{ fontSize: "1.08rem" }}>
            Manage business modules and areas
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
            setSelectedModule(null);
            setFormData({ name: '', description: '' });
            setIsModalOpen(true);
          }}
        >
          <span className="bi bi-plus-lg me-2"></span>
          Create Module
        </button>
      </div>

      {/* Module Cards */}
      <div className="row mb-4">
        {modules.map((module) => (
          <div key={module.id} className="col-md-4 mb-3">
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
                <div className="d-flex align-items-center">
                  <span
                    className={`bi ${moduleIcons[module.name] || "bi-box"} me-2`}
                    style={{ fontSize: "1.5rem", color: "#222" }}
                  ></span>
                  <h5 className="fw-semibold mb-0">{module.name}</h5>
                </div>
                <div>
                  <span
                    className="bi bi-pencil-square me-2"
                    role="button"
                    style={{ fontSize: "1.2rem", color: "#222" }}
                    title="Edit"
                    onClick={() => handleEdit(module)}
                  ></span>
                  <span
                    className="bi bi-trash"
                    role="button"
                    style={{ fontSize: "1.2rem", color: "#FF3B30" }}
                    title="Delete"
                    onClick={() => handleDeleteClick(module)}
                  ></span>
                </div>
              </div>
              <div className="mb-2 text-muted" style={{ minHeight: 38 }}>{module.description}</div>
              <div className="d-flex align-items-center mb-2">
                {/* Status badge - NOT clickable */}
                <span
                  className={`badge ${module.status === "Active" ? "bg-dark text-white" : "bg-light text-dark"}`}
                  style={{
                    fontWeight: 600,
                    fontSize: "1em",
                    borderRadius: 8,
                    padding: "6px 16px",
                    marginRight: 10
                  }}
                >
                  {module.status}
                </span>
                {/* Enable/Disable button - clickable */}
                {/* <button
                  className={`btn btn-sm ${module.status === "Active" ? "btn-outline-secondary" : "btn-outline-dark"}`}
                  style={{
                    fontWeight: 500,
                    borderRadius: 8,
                    minWidth: 80
                  }}
                  onClick={() => handleStatusToggle(module)}
                >
                  {module.status === "Active" ? "Disable" : "Enable"}
                </button> */}
              </div>
              <div style={{ fontWeight: 500, fontSize: "0.99em" }}>
                Permissions <span className="text-muted">({module.permissions?.length || 0})</span>
              </div>
              <div className="mb-2 mt-1" style={{ minHeight: 32 }}>
                {renderPermissions(module.permissions || [])}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modules Overview Table */}
      <div
        className="p-4 mb-3"
        style={{
          background: "#fff",
          border: "1px solid #e6e8ee",
          borderRadius: 10,
          boxShadow: "0 1px 2px rgba(20,20,40,0.03)"
        }}
      >
        <h4 className="fw-bold mb-3">Modules Overview</h4>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Module</th>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Description</th>
                {/* <th className="fw-semibold" style={{ color: "#48506b" }}>Status</th> */}
                <th className="fw-semibold" style={{ color: "#48506b" }}>Permissions</th>
                <th className="fw-semibold" style={{ color: "#48506b" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {modules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted py-4" style={{ textAlign: "center" }}>
                    No modules found
                  </td>
                </tr>
              ) : (
                modules.map((module) => (
                  <tr key={module.id}>
                    <td className="fw-semibold">
                      <span
                        className={`bi ${moduleIcons[module.name] || "bi-box"} me-2`}
                        style={{ fontSize: "1.2rem", verticalAlign: "-0.1em" }}
                      ></span>
                      {module.name}
                    </td>
                    <td>{module.description}</td>
                    {/* <td>{statusBadge(module.status)}</td> */}
                    <td>{module.permissions?.length || 0}</td>
                    <td>
                      <span
                        className="bi bi-pencil-square me-3"
                        role="button"
                        style={{ fontSize: "1.15rem", color: "#222" }}
                        title="Edit"
                        onClick={() => handleEdit(module)}
                      ></span>
                      <span
                        className="bi bi-trash"
                        role="button"
                        style={{ fontSize: "1.15rem", color: "#FF3B30" }}
                        title="Delete"
                        onClick={() => handleDeleteClick(module)}
                      ></span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Module Modal */}
      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{selectedModule ? 'Edit Module' : 'Add New Module'}</h5>
                  <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
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
                  <button type="submit" className="btn btn-primary">
                    {selectedModule ? 'Update' : 'Create'}
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && moduleToDelete && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Module</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelDelete}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the module{' '}
                  <strong>{moduleToDelete.name}</strong>?
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

export default Modules;
