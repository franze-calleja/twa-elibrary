/**
 * System Settings Page - Staff
 * Includes admin account management and system configuration
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAdminSchema, type CreateAdminInput } from '@/lib/validation'
import { useUsers, useCreateAdmin } from '@/hooks/useUsers'
import { ResetPasswordDialog } from '@/components/student-management'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Loader2, UserPlus, Shield, User, Mail, Phone, Eye, EyeOff, KeyRound } from 'lucide-react'
import { format } from 'date-fns'

export default function SettingsPage() {
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null)

  // Fetch existing staff accounts
  const { data, isLoading: loadingStaff, refetch } = useUsers({ role: 'STAFF', limit: 50 })
  const staffAccounts = data?.users ?? []

  const createAdmin = useCreateAdmin()

  const form = useForm<CreateAdminInput>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (values: CreateAdminInput) => {
    try {
      await createAdmin.mutateAsync(values)
      toast({
        title: 'Admin account created',
        description: `${values.firstName} ${values.lastName} can now log in with their email and password.`
      })
      form.reset()
      setDialogOpen(false)
      refetch()
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        'Failed to create admin account. Please try again.'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setShowPassword(false)
      setShowConfirmPassword(false)
    }
    setDialogOpen(open)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage system settings and admin accounts</p>
      </div>

      {/* Admin Accounts Section */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Accounts
            </CardTitle>
            <CardDescription>
              Staff members who can manage the library system. All admin accounts have full access to the dashboard.
            </CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="shrink-0">
            <UserPlus className="mr-2 h-4 w-4" />
            Create Admin
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {loadingStaff ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : staffAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Shield className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium">No admin accounts found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create the first admin account to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {staffAccounts.map((staff: any) => (
                <div key={staff.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {staff.firstName} {staff.middleName ? `${staff.middleName} ` : ''}{staff.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{staff.email}</p>
                        {staff.phone && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{staff.phone}</p>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Added {staff.createdAt ? format(new Date(staff.createdAt), 'MMM d, yyyy') : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={staff.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {staff.status}
                    </Badge>
                    <Badge variant="outline">Staff</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setResetTarget({
                          id: staff.id,
                          name: `${staff.firstName} ${staff.lastName}`,
                        })
                      }
                    >
                      <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                      Reset Password
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Create Admin Account
            </DialogTitle>
            <DialogDescription>
              Create a new staff account. The admin will be able to log in immediately with the provided credentials.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" {...field} />
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
                      <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Dela Cruz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Santos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="09XXXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 8 chars, upper, lower & number"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(v => !v)}
                          tabIndex={-1}
                        >
                          {showPassword
                            ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                            : <Eye className="h-4 w-4 text-muted-foreground" />}
                          <span className="sr-only">Toggle password</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Re-enter password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(v => !v)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword
                            ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                            : <Eye className="h-4 w-4 text-muted-foreground" />}
                          <span className="sr-only">Toggle confirm password</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={createAdmin.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createAdmin.isPending}>
                  {createAdmin.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      {resetTarget && (
        <ResetPasswordDialog
          userId={resetTarget.id}
          userName={resetTarget.name}
          open={!!resetTarget}
          onOpenChange={(open) => { if (!open) setResetTarget(null) }}
        />
      )}
    </div>
  )
}
