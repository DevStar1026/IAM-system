import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authSlice';
import './Login.css'; // <-- Import the CSS file

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(credentials));
    if (!result.error) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-bg">
      {/* Logo and Title */}
      <div className="text-center mb-4">
        <div className="login-logo mb-2">
          <i className="bi bi-shield-check" style={{ fontSize: 32, color: "#2060E8" }} />
        </div>
        <h2 className="login-title">IAM System</h2>
        <div className="login-subtitle">Identity & Access Management</div>
      </div>

      {/* Card */}
      <div className="card login-card">
        <div className="card-body p-4">
          <h5 className="login-card-title">Access Control System</h5>
          <div className="login-card-desc">
            Manage users, groups, roles, and permissions
          </div>

          {/* Tabs */}
          <div className="login-tabs">
            <button type="button" className="login-tab" disabled>
              Login
            </button>
            <button type="button" className="login-tab inactive" disabled>
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your email"
                required
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="login-btn"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="login-footer">
        <span>
          <i className="bi bi-people me-1"></i>User Management
        </span>
        <span>
          <i className="bi bi-shield-lock me-1"></i>Access Control
        </span>
        <span>
          <i className="bi bi-key me-1"></i>Permission System
        </span>
      </div>
    </div>
  );
};

export default Login;
