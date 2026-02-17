/**
 * Edit Student Dialog Component
 * Staff can edit student information with status transition validation
 */

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { staffUpdateStudentSchema, type StaffUpdateStudentInput } from '@/lib/validation'
import { useStudent, useUpdateStudent } from '@/hooks/useUsers'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Loader2, AlertCircle, Info } from 'lucide-react'

interface EditStudentDialogProps {
  studentId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditStudentDialog({ studentId, open, onOpenChange, onSuccess }: EditStudentDialogProps) {
  const { toast } = useToast()
  const { data, isLoading: loadingStudent } = useStudent(studentId!)
  const updateStudent = useUpdateStudent(studentId!)
  
  const form = useForm<StaffUpdateStudentInput>({
    resolver: zodResolver(staffUpdateStudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      program: '',
      yearLevel: 1,
      status: 'ACTIVE',
      borrowingLimit: 3
    }
  })
  
  // Update form when student data loads
  useEffect(() => {
    if (data?.user) {
      form.reset({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        program: data.user.program || '',
        yearLevel: data.user.yearLevel || 1,
        status: data.user.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
        borrowingLimit: data.user.borrowingLimit || 3
      })
    }
  }, [data, form])
  
  const onSubmit = (formData: StaffUpdateStudentInput) => {
    updateStudent.mutate(formData, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Student information updated successfully'
        })
        onOpenChange(false)
        form.reset()
        onSuccess?.()
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.error?.message || 'Failed to update student'
        const errorCode = error.response?.data?.error?.code
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        })
        
        // If it's a status transition error, highlight the status field
        if (errorCode === 'INVALID_STATUS_TRANSITION') {
          form.setError('status', { 
            type: 'manual', 
            message: errorMessage 
          })
        }
      }
    })
  }
  
  const currentStatus = data?.user?.status
  const isInactive = currentStatus === 'INACTIVE'
  const isActive = currentStatus === 'ACTIVE'
  const isSuspended = currentStatus === 'SUSPENDED'
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student Information</DialogTitle>
          <DialogDescription>
            Update student details, academic information, and account settings
          </DialogDescription>
        </DialogHeader>
        
        {loadingStudent ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Status Information Alert */}
            {isInactive && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This student is <strong>INACTIVE</strong> (pre-registered). They must complete registration to activate their account. You can edit their information, but inform them of any credential changes.
                </AlertDescription>
              </Alert>
            )}
            
            {isSuspended && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This student is <strong>SUSPENDED</strong>. They cannot borrow books until reactivated.
                </AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="John" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Doe" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="john.doe@example.com" />
                        </FormControl>
                        {isInactive && (
                          <FormDescription>
                            ⚠️ Changing email for INACTIVE student - inform them of the new email
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="09123456789" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Academic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="program"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="BS Computer Science" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="yearLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Level</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min={1}
                            max={13}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Account Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Settings</h3>
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INACTIVE" disabled={!isInactive}>
                              Inactive (Pre-registered)
                            </SelectItem>
                            <SelectItem value="ACTIVE" disabled={isInactive}>
                              Active
                            </SelectItem>
                            <SelectItem value="SUSPENDED">
                              Suspended
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {isInactive && 'INACTIVE accounts can only be activated through student registration'}
                          {isActive && 'Can change to SUSPENDED to prevent borrowing'}
                          {isSuspended && 'Can change to ACTIVE to restore access'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="borrowingLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Borrowing Limit</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min={0}
                            max={20}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of books the student can borrow (0-20)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    disabled={updateStudent.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateStudent.isPending}
                  >
                    {updateStudent.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Student'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
