/**
 * Pre-Register Students Page - Staff
 */

'use client'

import { useState } from 'react'
import { usePreRegisterStudent } from '@/hooks/useUsers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function PreRegisterPage() {
  const { toast } = useToast()
  const preRegister = usePreRegisterStudent()
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    middleName: '',
    studentId: '',
    program: '',
    yearLevel: 1,
    phone: '',
    borrowingLimit: 3
  })
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [studentData, setStudentData] = useState<any>(null)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    preRegister.mutate(formData, {
      onSuccess: (data) => {
        setStudentData(data.data.student)
        setShowSuccess(true)
        
        // Reset form
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          middleName: '',
          studentId: '',
          program: '',
          yearLevel: 1,
          phone: '',
          borrowingLimit: 3
        })
      },
      onError: (err: any) => {
        const errorMessage = err.response?.data?.error?.message || 'Failed to pre-register student'
        setError(errorMessage)
      }
    })
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pre-Register Students</h1>
        <p className="text-muted-foreground">Add students to the system before they activate their accounts</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>
            Fill in the student details. Students will be able to register using their information.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={preRegister.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={preRegister.isPending}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                disabled={preRegister.isPending}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={preRegister.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="20XX-XXXXX"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  disabled={preRegister.isPending}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program">Program *</Label>
                <Input
                  id="program"
                  name="program"
                  placeholder="e.g., BS Computer Science"
                  value={formData.program}
                  onChange={handleChange}
                  required
                  disabled={preRegister.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="yearLevel">Year Level *</Label>
                <Input
                  id="yearLevel"
                  name="yearLevel"
                  type="number"
                  min="1"
                  max="6"
                  value={formData.yearLevel}
                  onChange={handleChange}
                  required
                  disabled={preRegister.isPending}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="09XXXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={preRegister.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="borrowingLimit">Borrowing Limit *</Label>
                <Input
                  id="borrowingLimit"
                  name="borrowingLimit"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.borrowingLimit}
                  onChange={handleChange}
                  required
                  disabled={preRegister.isPending}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  email: '',
                  firstName: '',
                  lastName: '',
                  middleName: '',
                  studentId: '',
                  program: '',
                  yearLevel: 1,
                  phone: '',
                  borrowingLimit: 3
                })}
                disabled={preRegister.isPending}
              >
                Clear
              </Button>
              <Button type="submit" disabled={preRegister.isPending}>
                {preRegister.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Pre-Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Pre-Register Student
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
      
      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Student Pre-Registered Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              The student can now complete their registration online
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Student Details:</p>
              <p className="text-sm">Name: {studentData?.firstName} {studentData?.middleName && `${studentData.middleName} `}{studentData?.lastName}</p>
              <p className="text-sm">Email: {studentData?.email}</p>
              <p className="text-sm">Student ID: {studentData?.studentId}</p>
            </div>
            
            <Alert>
              <AlertDescription>
                The student should use their <strong>Student ID, First Name, Last Name, and Middle Name (if applicable)</strong> when registering to activate their account.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={() => setShowSuccess(false)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

