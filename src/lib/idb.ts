const DB_NAME = 'chaincacao-offline'
const DB_VERSION = 2
const STORE_NAMES = ['drafts', 'mutations', 'photos'] as const

type StoreName = (typeof STORE_NAMES)[number]

interface IndexedValue {
  id: string
}

function supportsIndexedDb() {
  return typeof indexedDB !== 'undefined'
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (!supportsIndexedDb()) {
    return Promise.resolve(null)
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result

      for (const storeName of STORE_NAMES) {
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName, { keyPath: 'id' })
        }
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function fallbackKey(storeName: StoreName) {
  return `chaincacao:${storeName}`
}

async function fallbackReadAll<T>(storeName: StoreName): Promise<T[]> {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(fallbackKey(storeName))
  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

async function fallbackWriteAll<T>(storeName: StoreName, value: T[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(fallbackKey(storeName), JSON.stringify(value))
}

export async function readAllRecords<T>(storeName: StoreName): Promise<T[]> {
  const database = await openDatabase()

  if (!database) {
    return fallbackReadAll<T>(storeName)
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error)
  })
}

export async function writeRecord<T extends IndexedValue>(storeName: StoreName, record: T) {
  const database = await openDatabase()

  if (!database) {
    const records = await fallbackReadAll<T>(storeName)
    const nextRecords = [...records.filter((current) => current.id !== record.id), record]
    await fallbackWriteAll(storeName, nextRecords)
    return record
  }

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(record)

    request.onsuccess = () => resolve(record)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteRecord(storeName: StoreName, id: string) {
  const database = await openDatabase()

  if (!database) {
    const records = await fallbackReadAll<IndexedValue>(storeName)
    await fallbackWriteAll(storeName, records.filter((record) => record.id !== id))
    return
  }

  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function clearRecords(storeName: StoreName) {
  const database = await openDatabase()

  if (!database) {
    await fallbackWriteAll(storeName, [])
    return
  }

  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.clear()

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function readRecord<T>(storeName: StoreName, id: string): Promise<T | null> {
  const database = await openDatabase()

  if (!database) {
    const records = await fallbackReadAll<T & { id: string }>(storeName)
    return records.find((record) => record.id === id) || null
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result as T | null)
    request.onerror = () => reject(request.error)
  })
}

export const offlineStores = {
  drafts: 'drafts' as const,
  mutations: 'mutations' as const,
  photos: 'photos' as const,
}
