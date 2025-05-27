import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

// Bootstrap Icons CDN required in your public/index.html!
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

const summaryCards = [
  {
    label: 'Users',
    icon: 'bi-people',
    color: '#2060E8',
    countKey: 'usersCount',
  },
  {
    label: 'Groups',
    icon: 'bi-person-arms-up',
    color: '#27B03A',
    countKey: 'groupsCount',
  },
  {
    label: 'Roles',
    icon: 'bi-shield',
    color: '#8B5CF6',
    countKey: 'rolesCount',
  },
  {
    label: 'Modules',
    icon: 'bi-database-fill',
    color: '#FF8800',
    countKey: 'modulesCount',
  },
  {
    label: 'Permissions',
    icon: 'bi-key',
    color: '#FF3B30',
    countKey: 'permissionsCount',
  },
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const [summary, setSummary] = useState({
    usersCount: 0,
    groupsCount: 0,
    rolesCount: 0,
    modulesCount: 0,
    permissionsCount: 0,
  });

  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [actions, setActions] = useState([]);

  const [selectedModule, setSelectedModule] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [simulationResult, setSimulationResult] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch current user's permissions
        const permRes = await axios.get(`${API_URL}/auth/me/permissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPermissions(permRes.data.permissions || []);

        // 2. Fetch all counts in parallel
        const [
          usersRes,
          groupsRes,
          rolesRes,
          modulesRes,
          permissionsRes,
        ] = await Promise.all([
          axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/groups`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/roles`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/modules`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/permissions`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        // If your API returns an array, use .length.
        // If it returns { count: X, data: [...] }, use .count.
        setSummary({
          usersCount: Array.isArray(usersRes.data.users) ? usersRes.data.users.length : usersRes.data.users.count || 0,
          groupsCount: Array.isArray(groupsRes.data.groups) ? groupsRes.data.groups.length : groupsRes.data.groups.count || 0,
          rolesCount: Array.isArray(rolesRes.data.roles) ? rolesRes.data.roles.length : rolesRes.data.roles.count || 0,
          modulesCount: Array.isArray(modulesRes.data.modules) ? modulesRes.data.modules.length : modulesRes.data.modules.count || 0,
          permissionsCount: Array.isArray(permissionsRes.data.permissions) ? permissionsRes.data.permissions.length : permissionsRes.data.permissions.count || 0,
        });

        // Optionally, get module/action names from API
        const moduleNames = modulesRes.data.modules.map(m => m.name || m.module_name);
        setModules(moduleNames);

        //setModules(['User', 'Group', 'Role', 'Module', 'Permission']);
        setActions(['Read', 'Write', 'Delete', 'Update']);
      } catch (err) {
        setPermissions([]);
        setSummary({
          usersCount: 0,
          groupsCount: 0,
          rolesCount: 0,
          modulesCount: 0,
          permissionsCount: 0,
        });
        setModules(['User', 'Group', 'Role', 'Module', 'Permission']);
        setActions(['Read', 'Write', 'Delete', 'Update']);
      }
    };
    fetchData();
  }, [token]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSimulate = (e) => {
    e.preventDefault();
    if (selectedModule && selectedAction) {
      // Simulate permission check

      const hasPermission = permissions.some(
        (p) =>
          p.module_name?.toLowerCase() === selectedModule.toLowerCase() &&
          p.action?.toLowerCase() === selectedAction.toLowerCase()
      );
      setSimulationResult(
        hasPermission
          ? 'You have this permission.'
          : "You don't have this permission."
      );
    }
  };

  return (
    <div className="bg-white min-vh-100 py-5">
      <div className="container">
        {/* Top: Title and subtitle */}
        <div className="mb-4">
          <h1 className="fw-bold mb-1" style={{ fontSize: '2.2rem' }}>Dashboard</h1>
          <div className="text-muted" style={{ fontSize: '1.1rem' }}>
            Overview of your IAM system
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row g-3 mb-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="col-6 col-md-2">
              <div
                className="border rounded-3 py-3 px-2 d-flex flex-column align-items-center justify-content-center bg-white h-100"
                style={{ minWidth: 120, minHeight: 100 }}
              >
                <span
                  className={`bi ${card.icon} mb-1`}
                  style={{ fontSize: 30, color: card.color }}
                ></span>
                <div className="fw-semibold" style={{ color: '#222' }}>{card.label}</div>
                <div className="fw-bold" style={{ fontSize: 22, color: card.color }}>
                  {summary[card.countKey]}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Panels */}
        <div className="row g-4">
          {/* Your Permissions */}
          <div className="col-12 col-md-6">
            <div className="border rounded-3 p-4 bg-white h-100">
              <h4 className="fw-bold mb-1">Your Permissions</h4>
              <div className="text-muted mb-3" style={{ fontSize: '1rem' }}>
                Permissions inherited through your group memberships
              </div>
              {permissions.length === 0 ? (
                <div className="text-muted" style={{ minHeight: 80 }}>
                  No permissions found
                </div>
              ) : (
                <ul className="list-unstyled mb-0">
                  {permissions.map((p) => (
                    <li key={p.id || `${p.module_name}-${p.action}`} className="mb-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary me-2">
                        {p.module_name}
                      </span>
                      <span className="badge bg-secondary bg-opacity-10 text-secondary">
                        {p.action}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* Action Simulation */}
          <div className="col-12 col-md-6">
            <div className="border rounded-3 p-4 bg-white h-100">
              <h4 className="fw-bold mb-1">Action Simulation</h4>
              <div className="text-muted mb-3" style={{ fontSize: '1rem' }}>
                Test if you can perform specific actions on modules
              </div>
              <form onSubmit={handleSimulate}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Module</label>
                  <select
                    className="form-select"
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                  >
                    <option value="">Select a module</option>
                    {modules.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Action</label>
                  <select
                    className="form-select"
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                  >
                    <option value="">Select an action</option>
                    {actions.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn-dark w-100 fw-semibold"
                  style={{ fontSize: '1.1rem' }}
                >
                  Simulate Action
                </button>
              </form>
              {simulationResult && (
                <div className="mt-3 alert alert-info py-2 px-3 mb-0">{simulationResult}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
