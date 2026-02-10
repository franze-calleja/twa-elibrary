/**
 * Barcode Scanner Dialog Component
 * Uses @zxing/browser for barcode scanning via webcam
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, CameraOff, AlertCircle } from 'lucide-react'

interface BarcodeScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (barcode: string) => void
}

export function BarcodeScannerDialog({ open, onOpenChange, onScan }: BarcodeScannerDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>()
  const codeReaderRef = useRef<any>(null)
  
  const startScanning = async () => {
    try {
      setError(undefined)
      setIsScanning(true)
      
      // Dynamically import @zxing/browser (client-side only)
      const { BrowserMultiFormatReader } = await import('@zxing/browser')
      
      // Constructor expects optional hints Map
      const codeReader = new BrowserMultiFormatReader(new Map())
      codeReaderRef.current = codeReader
      
      await codeReader.decodeFromVideoDevice(
        undefined, // Use default camera
        videoRef.current!,
        (result, err) => {
          if (result) {
            const code = result.getText()
            onScan(code)
            stopScanning()
            onOpenChange(false)
          }
          
          // Ignore "NotFoundException" which is normal when no barcode is visible
          // Only show errors for actual scanning problems
          if (err && err.name !== 'NotFoundException') {
            const errorMessage = 'Scanning error. Please try again.'
            setError(errorMessage)
          }
        }
      )
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to access camera. Please grant camera permissions.'
      setError(errorMessage)
      setIsScanning(false)
    }
  }
  
  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
    }
    setIsScanning(false)
  }
  
  useEffect(() => {
    if (open && !isScanning) {
      startScanning()
    }
    
    return () => {
      stopScanning()
    }
  }, [open])
  
  const handleClose = () => {
    stopScanning()
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
          <DialogDescription>
            Position the barcode within the camera view
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ display: isScanning ? 'block' : 'none' }}
            />
            
            {!isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            {isScanning && (
              <div className="absolute inset-0 border-2 border-primary/50 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-32 border-2 border-primary rounded-lg" />
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={isScanning ? stopScanning : startScanning}
              variant={isScanning ? 'destructive' : 'default'}
              className="flex-1"
            >
              {isScanning ? (
                <>
                  <CameraOff className="mr-2 h-4 w-4" />
                  Stop Scanning
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Start Scanning
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Make sure the barcode is clearly visible and well-lit
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
