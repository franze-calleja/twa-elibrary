/**
 * Edit Profile Form Component
 * Allows students to update phone number and avatar
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateProfile } from '@/hooks/useAccount'
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface EditProfileFormProps {
  initialPhone?: string | null
  initialAvatar?: string | null
}

export function EditProfileForm({ initialPhone, initialAvatar }: EditProfileFormProps) {
  const { toast } = useToast()
  const updateProfile = useUpdateProfile()

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      phone: initialPhone || '',
      avatar: initialAvatar || ''
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
    <Card>
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
                    />
                  </FormControl>
                  <FormDescription>
                    Your contact number (10-15 digits, optional + prefix)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Avatar URL */}
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/avatar.jpg" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    URL to your profile picture (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview Avatar */}
            {form.watch('avatar') && (
              <div className="space-y-2">
                <FormLabel>Preview</FormLabel>
                <div className="flex items-center gap-4">
                  <img
                    src={form.watch('avatar') || ''}
                    alt="Avatar preview"
                    className="h-16 w-16 rounded-full object-cover border-2 border-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=User'
                    }}
                  />
                  <p className="text-sm text-muted-foreground">Avatar preview</p>
                </div>
              </div>
            )}
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
