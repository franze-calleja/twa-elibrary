/**
 * Book Details Page - Staff
 * Server component that extracts params and renders client component
 */

import { BookDetailsContent } from '@/components/books/BookDetailsContent'

export default async function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <BookDetailsContent bookId={id} />
}
