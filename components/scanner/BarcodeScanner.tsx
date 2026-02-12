/**
 * Barcode Scanner Component
 * Uses @zxing/browser for barcode scanning via camera
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, Loader2 } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (code: string) => void
  onError?: (error: string) => void
}

export function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const codeReaderRef = useRef<BrowserMultiFormatReader | undefined>(undefined)

  const startScanning = async () => {
    try {
      setError(undefined)
      setIsLoading(true)
      
      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader
      
      await codeReader.decodeFromVideoDevice(
        undefined, // Use default camera
        videoRef.current!,
        (result, err) => {
          if (result) {
            const code = result.getText()
            onScan(code)
            stopScanning()
          }
          
          // Ignore NotFoundExceptions (when no barcode is in view)
          if (err && err.name !== 'NotFoundException') {
            const errorMessage = 'Scanning error. Please try again.'
            setError(errorMessage)
            onError?.(errorMessage)
          }
        }
      )
      
      setIsScanning(true)
      setIsLoading(false)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to access camera'
      setError(errorMessage)
      onError?.(errorMessage)
      setIsScanning(false)
      setIsLoading(false)
    }
  }

  const stopScanning = () => {
    if (codeReaderRef.current && videoRef.current) {
      // Stop all video tracks
      const stream = videoRef.current.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      codeReaderRef.current = undefined
    }
    setIsScanning(false)
  }

  useEffect(() => {
    // Auto-start scanning when component mounts
    startScanning()
    
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ display: isScanning ? 'block' : 'none' }}
        />
        
        {!isScanning && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-2" />
              <p className="text-sm">Initializing camera...</p>
            </div>
          </div>
        )}
        
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanning overlay */}
            <div className="absolute inset-0 border-2 border-primary/50 rounded-lg">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-primary rounded-lg" />
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white text-sm bg-black/50 inline-block px-4 py-2 rounded">
                Position barcode within the frame
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      <Button
        onClick={isScanning ? stopScanning : startScanning}
        variant={isScanning ? 'destructive' : 'default'}
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Starting...
          </>
        ) : isScanning ? (
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
    </div>
  )
}
