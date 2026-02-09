/**
 * Login Page
 * Handles authentication for both staff and students
 */

'use client'

import { useState, useEffect } from 'react'
import { useLogin, useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, BookOpen, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const login = useLogin()
  const { isAuthenticated, user } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'STAFF') {
        router.push('/staff/dashboard')
      } else {
        router.push('/student/dashboard')
      }
    }
  }, [isAuthenticated, user, router])
  
  // Show loading while redirecting
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    login.mutate(
      { email, password },
      {
        onError: (err: any) => {
          const errorMessage = err.response?.data?.error?.message || 'Login failed. Please try again.'
          setError(errorMessage)
        }
      }
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary p-3">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">TWA E-Library</h1>
        <p className="text-muted-foreground">Sign in to your account</p>
      </div>
      
      {/* Login Form */}
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the library system
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={login.isPending}
                autoComplete="email"
              />
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={login.isPending}
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            {/* Register Link */}
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-primary hover:underline font-medium"
              >
                Register here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      {/* Demo Credentials */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Demo Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <p className="font-medium">Staff Account:</p>
            <p className="text-muted-foreground">Email: staff@example.com</p>
            <p className="text-muted-foreground">Password: password123</p>
          </div>
          <div>
            <p className="font-medium">Student Account:</p>
            <p className="text-muted-foreground">Email: student@example.com</p>
            <p className="text-muted-foreground">Password: password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
