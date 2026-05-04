/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as localforage from 'localforage'
import {
  DEMO_RESET_EVENT,
  EXPORTER_UI_STORAGE_KEY,
  LOTS_STORAGE_KEY,
  VERIFY_QUERY_STORAGE_KEY,
} from '../constants/storageKeys'
import { cooperatives, farmers, lots as initialLots } from '../data/mockData'
import type { Lot } from '../types'

interface AppContextValue {
  farmers: typeof farmers
  cooperatives: typeof cooperatives
  lots: Lot[]
  addLot: (lot: Lot) => void
  updateLot: (id: string, updates: Partial<Lot>) => void
  resetDemoData: () => void
  findLotById: (id: string) => Lot | undefined
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

interface Props {
  children: React.ReactNode
}

export const AppProvider = ({ children }: Props) => {
  const [lots, setLots] = useState<Lot[]>(initialLots)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialization: load from localforage (IndexedDB)
  useEffect(() => {
    localforage.getItem<Lot[]>(LOTS_STORAGE_KEY).then((storedLots) => {
      if (storedLots && storedLots.length > 0) {
        setLots(storedLots)
      }
      setIsLoaded(true)
    }).catch(err => {
      console.error("Failed to load lots from localforage", err)
      setIsLoaded(true)
    })
  }, [])

  // Sync to localforage when lots change
  useEffect(() => {
    if (isLoaded) {
      localforage.setItem(LOTS_STORAGE_KEY, lots).catch(console.error)
    }
  }, [lots, isLoaded])

  const addLot = useCallback((lot: Lot) => {
    setLots((previousLots) => [lot, ...previousLots])
  }, [])

  const updateLot = useCallback((id: string, updates: Partial<Lot>) => {
    setLots((previousLots) =>
      previousLots.map((lot) =>
        lot.id === id
          ? {
              ...lot,
              ...updates,
            }
          : lot,
      ),
    )
  }, [])

  const resetDemoData = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(VERIFY_QUERY_STORAGE_KEY)
      window.localStorage.removeItem(EXPORTER_UI_STORAGE_KEY)
      localforage.removeItem(LOTS_STORAGE_KEY)
      window.dispatchEvent(new Event(DEMO_RESET_EVENT))
    }

    setLots(initialLots)
  }, [])

  const findLotById = useCallback(
    (id: string) => {
      const normalizedId = id.trim().toUpperCase()
      return lots.find((lot) => lot.id.toUpperCase() === normalizedId)
    },
    [lots],
  )

  const value = {
    farmers,
    cooperatives,
    lots,
    addLot,
    updateLot,
    resetDemoData,
    findLotById,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppData = () => {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useAppData must be used inside AppProvider')
  }

  return context
}
