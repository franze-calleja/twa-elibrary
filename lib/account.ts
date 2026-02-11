/**
 * Account Service
 * Utility functions for account management
 */

import type { UserProfile } from '@/store/accountStore'

/**
 * Format user's full name
 */
export function formatFullName(profile: UserProfile | null): string {
  if (!profile) return ''
  
  const parts = [
    profile.firstName,
    profile.middleName,
    profile.lastName
  ].filter(Boolean)
  
  return parts.join(' ')
}

/**
 * Get user's initials
 */
export function getUserInitials(profile: UserProfile | null): string {
  if (!profile) return ''
  
  const firstInitial = profile.firstName?.charAt(0) || ''
  const lastInitial = profile.lastName?.charAt(0) || ''
  
  return `${firstInitial}${lastInitial}`.toUpperCase()
}

/**
 * Check if phone number is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false
  const phoneRegex = /^[+]?[0-9]{10,15}$/
  return phoneRegex.test(phone)
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return 'Not provided'
  
  // Simple formatting for display
  // For Philippine numbers: +639171234567 -> +63 917 123 4567
  if (phone.startsWith('+63') && phone.length === 13) {
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`
  }
  
  return phone
}

/**
 * Get account status badge variant
 */
export function getStatusBadgeVariant(status: UserProfile['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ACTIVE':
      return 'default'
    case 'INACTIVE':
      return 'secondary'
    case 'SUSPENDED':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * Get account status display text
 */
export function getStatusDisplayText(status: UserProfile['status']): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active'
    case 'INACTIVE':
      return 'Inactive'
    case 'SUSPENDED':
      return 'Suspended'
    default:
      return 'Unknown'
  }
}

/**
 * Calculate borrowing capacity percentage
 */
export function getBorrowingCapacity(activeLoans: number, borrowingLimit: number): number {
  if (borrowingLimit === 0) return 0
  return Math.round((activeLoans / borrowingLimit) * 100)
}

/**
 * Get borrowing capacity color
 */
export function getBorrowingCapacityColor(percentage: number): string {
  if (percentage >= 90) return 'text-red-600'
  if (percentage >= 70) return 'text-yellow-600'
  return 'text-green-600'
}

/**
 * Validate avatar URL
 */
export function isValidAvatarUrl(url: string): boolean {
  if (!url) return false
  
  try {
    const parsedUrl = new URL(url)
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    return validExtensions.some(ext => parsedUrl.pathname.toLowerCase().endsWith(ext))
  } catch {
    return false
  }
}

/**
 * Get default avatar URL (placeholder)
 */
export function getDefaultAvatar(profile: UserProfile | null): string {
  const initials = getUserInitials(profile)
  // Using UI Avatars service for placeholder
  return `https://ui-avatars.com/api/?name=${initials}&background=random&size=200`
}

/**
 * Get avatar URL with fallback
 */
export function getAvatarUrl(profile: UserProfile | null): string {
  if (profile?.avatar && isValidAvatarUrl(profile.avatar)) {
    return profile.avatar
  }
  return getDefaultAvatar(profile)
}

/**
 * Format year level display
 */
export function formatYearLevel(yearLevel: number | null): string {
  if (!yearLevel) return 'N/A'
  
  const suffixes: Record<number, string> = {
    1: 'st',
    2: 'nd',
    3: 'rd'
  }
  
  const suffix = suffixes[yearLevel] || 'th'
  return `${yearLevel}${suffix} Year`
}

/**
 * Check if profile is complete
 */
export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false
  
  return !!(
    profile.firstName &&
    profile.lastName &&
    profile.email &&
    (profile.role === 'STAFF' || (
      profile.studentId &&
      profile.program &&
      profile.yearLevel
    ))
  )
}

/**
 * Get missing profile fields
 */
export function getMissingProfileFields(profile: UserProfile | null): string[] {
  if (!profile) return ['All fields']
  
  const missing: string[] = []
  
  if (!profile.firstName) missing.push('First Name')
  if (!profile.lastName) missing.push('Last Name')
  if (!profile.email) missing.push('Email')
  if (!profile.phone) missing.push('Phone Number')
  
  if (profile.role === 'STUDENT') {
    if (!profile.studentId) missing.push('Student ID')
    if (!profile.program) missing.push('Program')
    if (!profile.yearLevel) missing.push('Year Level')
  }
  
  return missing
}

/**
 * Calculate account age in days
 */
export function getAccountAge(createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - created.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Format account age for display
 */
export function formatAccountAge(createdAt: string): string {
  const days = getAccountAge(createdAt)
  
  if (days < 30) {
    return `${days} day${days === 1 ? '' : 's'} ago`
  }
  
  const months = Math.floor(days / 30)
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`
  }
  
  const years = Math.floor(months / 12)
  return `${years} year${years === 1 ? '' : 's'} ago`
}
