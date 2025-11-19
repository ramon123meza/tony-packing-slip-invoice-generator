import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <img
              src="https://prompt-images-nerd.s3.us-east-1.amazonaws.com/logo_toys.png"
              alt="M&J Toys Logo"
              className="navbar-logo"
            />
            <span>M&J Toys Inc.</span>
          </div>

          <div className="navbar-links">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Generate
            </Link>
            <Link
              to="/history"
              className={`nav-link ${isActive('/history') ? 'active' : ''}`}
            >
              History
            </Link>
            <Link
              to="/settings"
              className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
            >
              Settings
            </Link>
          </div>

          <div className="navbar-user">
            <span className="username">Welcome, {user?.username}!</span>
            <button onClick={logout} className="btn btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <p>&copy; 2024 M&J Toys Inc. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Layout
