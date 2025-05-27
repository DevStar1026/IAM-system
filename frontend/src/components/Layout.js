import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

const SIDEBAR_WIDTH = 240;

const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: <i className="bi bi-house-door"></i> },
  { name: "Users", path: "/users", icon: <i className="bi bi-people"></i> },
  { name: "Groups", path: "/groups", icon: <i className="bi bi-people-fill"></i> },
  { name: "Roles", path: "/roles", icon: <i className="bi bi-key"></i> },
  { name: "Modules", path: "/modules", icon: <i className="bi bi-box"></i> },
  { name: "Permissions", path: "/permissions", icon: <i className="bi bi-shield-lock"></i> },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prevent scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [sidebarOpen]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div>
      {/* Hamburger Button (mobile only) */}
      <button
        className="sidebar-toggle"
        aria-label="Open sidebar"
        onClick={() => setSidebarOpen(true)}
      >
        <i className="bi bi-list" style={{ fontSize: 24 }} />
      </button>

      {/* Overlay (mobile only, visible only if sidebarOpen) */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        onClick={e => e.stopPropagation()} // Prevent click-through from closing sidebar
      >
        {/* Close button for mobile */}
        <div className="d-lg-none d-flex justify-content-end p-2">
          <button
            aria-label="Close sidebar"
            className="btn btn-light"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
        {/* Logo and Title */}
        <div className="d-flex align-items-center px-4 py-3 border-bottom" style={{ minHeight: 64 }}>
          <i className="bi bi-shield-check" style={{ fontSize: 24, color: "#2060E8", marginRight: 8 }} />
          <span className="fw-bold" style={{ fontSize: 20, letterSpacing: 0.5 }}>IAM System</span>
        </div>
        {/* Navigation */}
        <nav className="nav flex-column mt-2">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link d-flex align-items-center px-4 py-2 ${location.pathname === item.path ? 'active-nav' : 'text-secondary'}`}
              style={{
                fontWeight: 500,
                background: location.pathname === item.path ? "#f0f4ff" : "transparent",
                color: location.pathname === item.path ? "#2060E8" : "#222",
                borderLeft: location.pathname === item.path ? "4px solid #2060E8" : "4px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <span className="me-2" style={{ fontSize: 18 }}>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        {/* Bottom: Back to Login */}
        <div className="px-4 py-3 border-top mt-auto">
          <button
            className="btn btn-link text-secondary p-0 d-flex align-items-center"
            onClick={handleLogout}
            style={{ fontWeight: 500, textDecoration: "none" }}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Login
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="container-fluid px-4 py-4">
          {children}
        </div>
      </main>

      {/* Responsive CSS */}
      <style>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: ${SIDEBAR_WIDTH}px;
          height: 100vh;
          background: #fff;
          z-index: 200;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s cubic-bezier(.4,0,.2,1);
        }
        .main-content {
          margin-left: ${SIDEBAR_WIDTH}px;
          background: #f8fafc;
          min-height: 100vh;
          transition: margin-left 0.2s;
        }
        .sidebar-toggle {
          position: fixed;
          top: 18px;
          left: 18px;
          z-index: 200;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          padding: 8px 12px;
          display: none;
          align-items: center;
        }
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.23);
          z-index: 110;
        }
        @media (max-width: 991.98px) {
          .sidebar {
            transform: translateX(-100%);
            box-shadow: none;
          }
          .sidebar.open {
            transform: translateX(0);
            box-shadow: 0 0 0 100vw rgba(0,0,0,0.23);
          }
          .main-content {
            margin-left: 0 !important;
          }
          .sidebar-toggle {
            display: flex !important;
          }
        }
        @media (min-width: 992px) {
          .sidebar-toggle {
            display: none !important;
          }
          .sidebar {
            transform: translateX(0) !important;
            box-shadow: none !important;
          }
          .sidebar-overlay {
            display: none !important;
          }
        }
        .active-nav {
          color: #2060E8 !important;
          background: #f0f4ff !important;
          border-left: 4px solid #2060E8 !important;
        }
      `}</style>
    </div>
  );
}