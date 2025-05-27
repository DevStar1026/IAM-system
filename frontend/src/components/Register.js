import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../features/auth/authSlice';
import './Custom.css';

const initialErrors = {
  username: '',
  email: '',
  confirmEmail: '',
  password: '',
};

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    confirmEmail: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState(initialErrors);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // Validation functions
  const validateUsername = (username) => {
    if (!username) return 'Username is required.';
    if (username.length < 3) return 'Username must be at least 3 characters.';
    if (!/^[A-Za-z0-9]+$/.test(username)) return 'Username can only contain letters and numbers.';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required.';
    // Simple email regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address.';
    return '';
  };

  const validateConfirmEmail = (confirmEmail, email) => {
    if (!confirmEmail) return 'Please confirm your email.';
    if (confirmEmail !== email) return 'Emails do not match.';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (!/[A-Za-z]/.test(password)) return 'Password must include at least one letter.';
    if (!/[0-9]/.test(password)) return 'Password must include at least one number.';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one symbol.';
    return '';
  };

  // Validate field on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    let errors = { ...formErrors, [name]: '' };
    let newUserData = { ...userData, [name]: value };

    // Validate each field as it changes
    if (name === 'username') errors.username = validateUsername(value);
    if (name === 'email') {
      errors.email = validateEmail(value);
      errors.confirmEmail = validateConfirmEmail(newUserData.confirmEmail, value);
    }
    if (name === 'confirmEmail') errors.confirmEmail = validateConfirmEmail(value, newUserData.email);
    if (name === 'password') errors.password = validatePassword(value);

    setUserData(newUserData);
    setFormErrors(errors);
  };

  // Validate all fields on submit
  const validateAll = () => {
    const errors = {
      username: validateUsername(userData.username),
      email: validateEmail(userData.email),
      confirmEmail: validateConfirmEmail(userData.confirmEmail, userData.email),
      password: validatePassword(userData.password),
    };
    setFormErrors(errors);
    // Return true if no errors
    return Object.values(errors).every((e) => !e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    const { confirmEmail, ...registerData } = userData;
    const result = await dispatch(register(registerData));
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

      {/* Card Container */}
      <div className="card shadow-lg rounded-3 w-100" style={{ maxWidth: '400px' }}>
        <div className="card-body p-4">
          {/* Header */}
          <h2 className="login-card-title text-center mb-4 fw-bold">Create an Account</h2>

          {/* Server Error (if any) */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-semibold">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={userData.username}
                onChange={handleChange}
                className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                placeholder="Enter your username"
                required
                autoComplete="username"
              />

              {formErrors.username && (
                <div className="invalid-feedback d-block">
                  {formErrors.username}
                </div>
              )}
            </div>
            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                placeholder="Enter your email"
                required
                autoComplete="email"
              />

              {formErrors.email && (
                <div className="invalid-feedback d-block" >
                  {formErrors.email}
                </div>
              )}
            </div>
            {/* Confirm Email */}
            <div className="mb-3">
              <label htmlFor="confirmEmail" className="form-label fw-semibold">Confirm Email</label>
              <input
                type="email"
                id="confirmEmail"
                name="confirmEmail"
                value={userData.confirmEmail}
                onChange={handleChange}
                className={`form-control ${formErrors.confirmEmail ? 'is-invalid' : ''}`}
                placeholder="Re-enter your email"
                required
                autoComplete="email"
              />

              {formErrors.confirmEmail && (
                <div className="invalid-feedback d-block" >
                  {formErrors.confirmEmail}
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
                value={userData.password}
                onChange={handleChange}
                className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                placeholder="Create a password"
                required
                autoComplete="new-password"
              />

              {formErrors.password && (
                <div className="invalid-feedback d-block" >
                  {formErrors.password}
                </div>
              )}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-btn mb-3"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          {/* Additional Text */}
          <p className="text-center text-muted small">
            Already have an account?{' '}
            <a href="/login" className="text-decoration-none text-primary fw-semibold">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
