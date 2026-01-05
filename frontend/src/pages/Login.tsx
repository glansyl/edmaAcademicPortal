import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Star } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
      
      // Navigation will be handled by the App component based on user role
      navigate('/')
    } catch (error) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden">
        <div className="flex min-h-[700px]">
          {/* Left Panel - Beautiful blue gradient with floating elements */}
          <div className="w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden flex flex-col justify-end p-12 text-white">
            {/* Floating geometric elements */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-16 w-32 h-32 bg-white/5 rounded-2xl rotate-12 backdrop-blur-sm"></div>
              <div className="absolute top-40 right-20 w-24 h-24 bg-white/8 rounded-xl -rotate-6 backdrop-blur-sm"></div>
              <div className="absolute bottom-60 left-20 w-28 h-28 bg-white/6 rounded-2xl rotate-45 backdrop-blur-sm"></div>
              <div className="absolute bottom-32 right-16 w-20 h-20 bg-white/7 rounded-lg -rotate-12 backdrop-blur-sm"></div>
              <div className="absolute top-60 left-1/3 w-16 h-16 bg-white/4 rounded-xl rotate-30 backdrop-blur-sm"></div>
              <div className="absolute bottom-80 right-1/3 w-36 h-36 bg-white/3 rounded-3xl -rotate-3 backdrop-blur-sm"></div>
            </div>
            
            {/* Subtle light overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10"></div>
            
            {/* Content */}
            <div className="relative z-10 max-w-md">
              <div className="mb-12">
                <Star className="h-10 w-10 text-white/90 mb-8" />
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight">
                  Welcome to your<br />
                  Academic Portal
                </h1>
                
                <p className="text-xl text-blue-100 leading-relaxed">
                  Access your courses, attendance, marks, and schedules through our comprehensive academic management system.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-16">
              <p className="text-blue-200/80 text-sm">
                © 2024 Academic Portal. All rights reserved.
              </p>
            </div>
          </div>

          {/* Right Panel - Clean and modern form */}
          <div className="w-1/2 bg-white flex flex-col justify-center px-16 py-12">
            <div className="max-w-sm w-full mx-auto">
              {/* Header */}
              <div className="mb-12">
                <div className="mb-8">
                  <Star className="h-6 w-6 text-blue-600 mb-6" />
                </div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-3">
                  Sign in
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Enter your credentials to access the portal
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Email address"
                    />
                  </div>

                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Password"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-xl shadow-blue-600/40 hover:shadow-2xl hover:shadow-blue-600/50 transform hover:-translate-y-0.5"
                  >
                    Sign In
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    Need help accessing your account?
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
