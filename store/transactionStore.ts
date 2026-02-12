/**
 * Transaction Store (Zustand)
 * Manages transaction/borrowing state
 */

import { create } from 'zustand'
import type { Transaction } from '@prisma/client'

interface TransactionStore {
  // Current active transaction being viewed/processed
  currentTransaction: Transaction | null
  setCurrentTransaction: (transaction: Transaction | null) => void
  
  // Pending requests count (for staff notification badge)
  pendingCount: number
  setPendingCount: (count: number) => void
  
  // Recently scanned barcode
  scannedBarcode: string | null
  setScannedBarcode: (barcode: string | null) => void
  
  // Clear all state
  clearTransaction: () => void
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  currentTransaction: null,
  setCurrentTransaction: (transaction) => set({ currentTransaction: transaction }),
  
  pendingCount: 0,
  setPendingCount: (count) => set({ pendingCount: count }),
  
  scannedBarcode: null,
  setScannedBarcode: (barcode) => set({ scannedBarcode: barcode }),
  
  clearTransaction: () => set({
    currentTransaction: null,
    scannedBarcode: null
  })
}))
