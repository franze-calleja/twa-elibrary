/**
 * Barcode Scanner Page - Student
 * Scan barcode and create borrow request
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import { BorrowRequestDialog } from '@/components/transactions/BorrowRequestDialog'
import { useBook } from '@/hooks/useBooks'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, BookOpen, ScanLine, Info } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

export default function ScanBookPage() {
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [showBorrowDialog, setShowBorrowDialog] = useState(false)

  const { data, isLoading, error } = useBook(scannedBarcode || '')
  const book = data?.book

  const handleScan = (code: string) => {
    setScannedBarcode(code)
    setShowScanner(false)
  }

  const handleReset = () => {
    setScannedBarcode(null)
    setShowScanner(false)
    setShowBorrowDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scan to Borrow</h1>
        <p className="text-muted-foreground">
          Scan a book's barcode to create a borrow request
        </p>
      </div>

      {/* Instructions */}
      {!scannedBarcode && !showScanner && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How to borrow a book</AlertTitle>
          <AlertDescription>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Click "Start Scanner" and allow camera access</li>
              <li>Point your camera at the book's barcode</li>
              <li>Review the book details and select borrow duration</li>
              <li>Submit request and wait for staff approval</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {/* Scanner Card */}
      {!scannedBarcode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5" />
              Barcode Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showScanner ? (
              <BarcodeScanner
                onScan={handleScan}
                onError={(err) => console.error('Scanner error:', err)}
              />
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                  <ScanLine className="h-10 w-10 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Ready to scan? Click the button below to activate your camera
                </p>
                <Button onClick={() => setShowScanner(true)} size="lg">
                  Start Scanner
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {scannedBarcode && isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Skeleton className="w-24 h-32 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {scannedBarcode && error && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Book Not Found</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <p>
              No book found with barcode: <strong>{scannedBarcode}</strong>
            </p>
            <p className="text-sm">
              {error.message || 'This barcode does not exist in our library system.'}
            </p>
            <Button onClick={handleReset} variant="outline" size="sm" className="w-fit">
              Scan Another Book
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Book Details */}
      {book && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Book Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative w-28 h-40 shrink-0 overflow-hidden rounded-md bg-muted">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">{book.title}</h3>
                <p className="text-muted-foreground mb-2">{book.author}</p>
                {book.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {book.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant={book.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                    {book.status}
                  </Badge>
                  {book.availableQuantity > 0 ? (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      {book.availableQuantity} available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                      Not available
                    </Badge>
                  )}
                </div>
                {book.location && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Location:</strong> {book.location}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowBorrowDialog(true)}
                disabled={book.status !== 'AVAILABLE' || book.availableQuantity < 1}
                className="flex-1"
              >
                Request to Borrow
              </Button>
              <Button onClick={handleReset} variant="outline">
                Scan Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Borrow Request Dialog */}
      {book && (
        <BorrowRequestDialog
          book={book as any}
          barcode={scannedBarcode || undefined}
          open={showBorrowDialog}
          onOpenChange={(open) => {
            setShowBorrowDialog(open)
            if (!open) {
              // Reset after dialog closes
              setTimeout(handleReset, 500)
            }
          }}
        />
      )}
    </div>
  )
}

