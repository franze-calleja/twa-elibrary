/**
 * Student Registration/Activation Page
 */

'use client'

import { useState } from 'react'
import { useRegister } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, BookOpen, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const register = useRegister()
  
  const [formData, setFormData] = useState({
    email: '',
    studentId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }
    
    register.mutate(formData, {
      onSuccess: () => {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      },
      onError: (err: any) => {
        const errorMessage = err.response?.data?.error?.message || 'Registration failed. Please try again.'
        setError(errorMessage)
      }
    })
  }
  
  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Registration Complete!</h1>
          <p className="text-muted-foreground">
            Your account has been activated successfully.
          </p>
        </div>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Redirecting to login page...</p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      </div>
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
        <p className="text-muted-foreground">Activate your student account</p>
      </div>
      
      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Student Registration</CardTitle>
          <CardDescription>
            Complete your registration using the same information provided during pre-registration
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
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={register.isPending}
                autoComplete="email"
              />
              <p className="text-xs text-muted-foreground">
                Use the email address registered by the library staff
              </p>
            </div>
            
            {/* Student ID Field */}
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                name="studentId"
                type="text"
                placeholder="20XX-XXXXX"
                value={formData.studentId}
                onChange={handleChange}
                required
                disabled={register.isPending}
                autoComplete="off"
              />
            </div>
            
            {/* First Name Field */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First name as registered"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={register.isPending}
                autoComplete="given-name"
              />
            </div>
            
            {/* Last Name Field */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last name as registered"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={register.isPending}
                autoComplete="family-name"
              />
            </div>
            
            {/* Middle Name Field */}
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name (Optional)</Label>
              <Input
                id="middleName"
                name="middleName"
                type="text"
                placeholder="Middle name if registered"
                value={formData.middleName}
                onChange={handleChange}
                disabled={register.isPending}
                autoComplete="additional-name"
              />
              <p className="text-xs text-muted-foreground">
                Enter exactly as registered, or leave blank if not registered with middle name
              </p>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={register.isPending}
                autoComplete="new-password"
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>
            
            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={register.isPending}
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={register.isPending}
            >
              {register.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating Account...
                </>
              ) : (
                'Activate Account'
              )}
            </Button>
            
            {/* Login Link */}
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-primary hover:underline font-medium"
              >
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      {/* Help Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            If you were not pre-registered by the library staff or encounter any issues, 
            please contact the library or visit in person.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
