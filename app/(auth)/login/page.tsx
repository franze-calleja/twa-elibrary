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
import { Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const login = useLogin()
  const { isAuthenticated, user } = useAuth()
  
  const [identifier, setIdentifier] = useState('')
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
      { identifier, password },
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
      {/* Header (moved into form) */}
      
      {/* Login Form */}
      <div className="rounded-lg overflow-hidden border">
        <div className="h-1 bg-primary" />
        <Card>
        <CardHeader>
            <div className="flex justify-center mb-2">
              <Image
                src="/digital-library-seal.png"
                alt="TWA E-Library"
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
            </div>
            <div className="text-center mb-2">
              <h1 className="text-2xl font-bold">TWA E-Library</h1>
              <p className="text-sm text-muted-foreground">Sign in to your account</p>
            </div>
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
            
            {/* Identifier Field (Email or Student ID) */}
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Student ID</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="your.email@example.com or A21-00001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={login.isPending}
                autoComplete="username"
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
          
          <CardFooter className="flex flex-col space-y-6 mt-6">
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
      </div>
    </div>
  )
}
