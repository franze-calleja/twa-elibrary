/**
 * Barcode Generation Utilities
 * Handles barcode generation for books using CODE128 format
 */

import { prisma } from './prisma'

/**
 * Generate unique barcode with format: LIB-{YEAR}-{SEQUENCE}
 * Example: LIB-2026-00001
 */
export async function generateUniqueBarcode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `LIB-${year}-`
  
  // Find the highest sequence number for this year
  const lastBook = await prisma.book.findFirst({
    where: {
      barcode: {
        startsWith: prefix
      }
    },
    orderBy: {
      barcode: 'desc'
    },
    select: {
      barcode: true
    }
  })
  
  let sequence = 1
  
  if (lastBook) {
    // Extract sequence number from barcode
    const match = lastBook.barcode.match(/LIB-\d{4}-(\d+)/)
    if (match && match[1]) {
      sequence = parseInt(match[1], 10) + 1
    }
  }
  
  // Pad sequence number to 5 digits
  const paddedSequence = sequence.toString().padStart(5, '0')
  
  return `${prefix}${paddedSequence}`
}

/**
 * Validate barcode format
 */
export function isValidBarcodeFormat(barcode: string): boolean {
  // LIB-{YEAR}-{5 digits} format
  const pattern = /^LIB-\d{4}-\d{5}$/
  return pattern.test(barcode)
}

/**
 * Check if barcode already exists in database
 */
export async function barcodeExists(barcode: string): Promise<boolean> {
  const book = await prisma.book.findUnique({
    where: { barcode },
    select: { id: true }
  })
  
  return !!book
}

/**
 * Generate barcode image data URL (for printing/display)
 * Uses bwip-js for CODE128 format
 * Note: This is a server-side utility - use in API routes
 */
export async function generateBarcodeImage(text: string): Promise<string> {
  try {
    const bwipjs = await import('bwip-js')
    
    const png = await bwipjs.default.toBuffer({
      bcid: 'code128',       // Barcode type: CODE128
      text: text,            // Text to encode
      scale: 3,              // 3x scaling factor
      height: 10,            // Bar height in millimeters
      includetext: true,     // Show human-readable text
      textxalign: 'center',  // Center align text
      textsize: 13           // Text size
    })
    
    // Convert buffer to base64 data URL
    return `data:image/png;base64,${png.toString('base64')}`
  } catch (error) {
    console.error('Barcode image generation error:', error)
    throw new Error('Failed to generate barcode image')
  }
}

/**
 * Sanitize barcode input (remove spaces, convert to uppercase)
 */
export function sanitizeBarcode(barcode: string): string {
  return barcode.trim().toUpperCase().replace(/\s+/g, '')
}
