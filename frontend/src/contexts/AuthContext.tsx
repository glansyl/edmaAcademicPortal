import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'
import { authService } from '@/services/authService'
import { logger } from '@/lib/logger'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken()
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          logger.error('Failed to fetch current user:', error)
          // Clear invalid token
          authService.logout()
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password })
    authService.setToken(response.token)
    
    // Fetch full user profile from backend
    try {
      const currentUser = await authService.getCurrentUser()
      authService.setUser(currentUser)
      setUser(currentUser)
    } catch (error) {
      // Fallback: construct basic user object from login response
      const user: User = {
        id: response.userId,
        email: response.email,
        role: response.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      authService.setUser(user)
      setUser(user)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
