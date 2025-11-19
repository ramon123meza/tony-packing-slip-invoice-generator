import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext({})

// Hardcoded credentials
const VALID_CREDENTIALS = [
  { username: 'admin', password: 'admin123' },
  { username: 'tony', password: 'mjtoys2024' },
  { username: 'user', password: 'user123' }
]

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Check user session on mount
  useEffect(() => {
    checkUserSession()
  }, [])

  const checkUserSession = () => {
    try {
      const storedUser = localStorage.getItem('mjToys_user')

      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      }
    } catch (error) {
      console.error('Error checking session:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = (username, password) => {
    try {
      // Check credentials
      const validUser = VALID_CREDENTIALS.find(
        cred => cred.username === username && cred.password === password
      )

      if (validUser) {
        const userData = {
          username: validUser.username,
          loginTime: new Date().toISOString()
        }
        localStorage.setItem('mjToys_user', JSON.stringify(userData))
        setUser(userData)
        navigate('/')
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Error during login:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('mjToys_user')
    setUser(null)
    navigate('/login')
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    checkUserSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
