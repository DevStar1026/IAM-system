import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Custom.css';

const validateUsername = (username) => {
  if (!username) return 'Username is required.';
  if (username.length < 3) return 'Username must be at least 3 characters.';
  if (/\s/.test(username)) return 'Username must not contain spaces.';
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  if (!/[A-Za-z]/.test(password)) return 'Password must include a letter.';
  if (!/[0-9]/.test(password)) return 'Password must include a number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include a symbol.';
  return '';
};

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' }); // clear error on change
  };

  const validateFields = () => {
    const errors = {};
    errors.username = validateUsername(credentials.username);
    errors.password = validatePassword(credentials.password);
    setFieldErrors(errors);
    // Only valid if both errors are empty string
    return !errors.username && !errors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) {
      return;
    }
    const result = await dispatch(login(credentials));
    if (!result.error) {
      navigate('/dashboard');
    } else {
      // Show server error as toast
      toast.error(result.error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-bg">
      <ToastContainer position="top-center" />
      {/* Logo and Title */}
      <div className="text-center mb-4">
        <div className="login-logo mb-2">
          <i className="bi bi-shield-check" style={{ fontSize: 32, color: "#2060E8" }} />
        </div>
        <h2 className="login-title">IAM System</h2>
        <div className="login-subtitle">Identity & Access Management</div>
      </div>
      {/* Card Container */}
      <div className="card shadow-lg rounded-3 w-100" style={{ maxWidth: '400px' }}>
        <div className="card-body p-4">
          {/* Header */}
          <h2 className="login-card-title text-center mb-4 fw-bold">Login</h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="needs-validation" noValidate>
            {/* Username */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-semibold">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
                placeholder="Enter your username"
                required
              />
              {fieldErrors.username && (
                <div className="invalid-feedback d-block">
                  {fieldErrors.username}
                </div>
              )}
            </div>
            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                placeholder="Enter your password"
                required
              />
              {fieldErrors.password && (
                <div className="invalid-feedback d-block">
                  {fieldErrors.password}
                </div>
              )}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-btn"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>

          {/* Additional Text */}
          <p className="text-center text-muted small mt-3">
            Don't have an account?{' '}
            <a href="/register" className="text-decoration-none text-primary fw-semibold">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;