/**
 * Edit Profile Form Component
 * Allows students to update phone number and avatar
 */

'use client'

import { } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateProfile, useProfile } from '@/hooks/useAccount'
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface EditProfileFormProps {
  initialPhone?: string | null
}

export function EditProfileForm({ initialPhone }: EditProfileFormProps) {
  const { toast } = useToast()
  const updateProfile = useUpdateProfile()
  const { data: profile } = useProfile()

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      phone: initialPhone || ''
    }
  })

  const onSubmit = (data: UpdateProfileInput) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Profile updated successfully'
        })
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.error?.message || 'Failed to update profile'
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        })
      }
    })
  }

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your contact information and avatar</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+639171234567" 
                      {...field} 
                      value={field.value || ''}
                      className="border border-slate-200 focus-visible:border-[#f59e0b] focus-visible:ring-[#f59e0b]/20"
                    />
                  </FormControl>
                  <FormDescription>
                    Your contact number (10-15 digits, optional + prefix)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email (read-only) */}
            <div>
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    value={profile?.email || ''}
                    readOnly
                    disabled
                    className="border border-slate-200 bg-slate-50"
                  />
                </FormControl>
                <FormDescription>Your account email (cannot be changed here)</FormDescription>
              </FormItem>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={updateProfile.isPending}
            >
              Reset
            </Button>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
