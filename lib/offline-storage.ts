// This file would implement the IndexedDB storage for offline functionality

// Define database schema
const DB_NAME = "tax-collection-db"
const DB_VERSION = 1
const STORES = {
  collections: "collections",
  payers: "payers",
  properties: "properties",
  syncQueue: "syncQueue",
  users: "users",
}

// Initialize the database
export async function initDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject("IndexedDB not supported")
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      reject("Database error: " + request.error)
    }

    request.onsuccess = (event) => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result

      // Create object stores
      if (!db.objectStoreNames.contains(STORES.collections)) {
        const collectionsStore = db.createObjectStore(STORES.collections, { keyPath: "id", autoIncrement: true })
        collectionsStore.createIndex("vendorId", "vendorId", { unique: false })
        collectionsStore.createIndex("status", "status", { unique: false })
        collectionsStore.createIndex("date", "date", { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.payers)) {
        const payersStore = db.createObjectStore(STORES.payers, { keyPath: "id", autoIncrement: true })
        payersStore.createIndex("name", "name", { unique: false })
        payersStore.createIndex("type", "type", { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.properties)) {
        const propertiesStore = db.createObjectStore(STORES.properties, { keyPath: "id", autoIncrement: true })
        propertiesStore.createIndex("vendorId", "vendorId", { unique: false })
        propertiesStore.createIndex("type", "type", { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.syncQueue)) {
        const syncQueueStore = db.createObjectStore(STORES.syncQueue, { keyPath: "id", autoIncrement: true })
        syncQueueStore.createIndex("type", "type", { unique: false })
        syncQueueStore.createIndex("objectId", "objectId", { unique: false })
        syncQueueStore.createIndex("action", "action", { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.users)) {
        db.createObjectStore(STORES.users, { keyPath: "id" })
      }
    }
  })
}

// Add an item to a store
export async function addItem(storeName, item) {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)
    const request = store.add(item)

    request.onsuccess = () => {
      // Add to sync queue
      addToSyncQueue(storeName, request.result, "add")
        .then(() => {
          resolve({
            ...item,
            id: request.result,
          })
        })
        .catch(reject)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Update an item in a store
export async function updateItem(storeName, item) {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)
    const request = store.put(item)

    request.onsuccess = () => {
      // Add to sync queue
      addToSyncQueue(storeName, item.id, "update")
        .then(() => {
          resolve(item)
        })
        .catch(reject)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Get all items from a store
export async function getAllItems(storeName) {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly")
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Get an item by ID
export async function getItemById(storeName, id) {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly")
    const store = transaction.objectStore(storeName)
    const request = store.get(id)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Add an item to the sync queue
async function addToSyncQueue(objectType, objectId, action) {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.syncQueue, "readwrite")
    const store = transaction.objectStore(STORES.syncQueue)
    const request = store.add({
      objectType,
      objectId,
      action,
      timestamp: new Date().toISOString(),
    })

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Get database instance (singleton)
let dbInstance = null
async function getDatabase() {
  if (dbInstance) return dbInstance

  dbInstance = await initDatabase()
  return dbInstance
}

// Process sync queue
export async function processSyncQueue(apiEndpoint) {
  if (!navigator.onLine) return { success: false, message: "Offline" }

  try {
    const db = await getDatabase()
    const syncItems = await getAllItems(STORES.syncQueue)

    if (syncItems.length === 0) {
      return { success: true, message: "No items to sync" }
    }

    // Group by object type for batch processing
    const itemsByType = syncItems.reduce((acc, item) => {
      if (!acc[item.objectType]) acc[item.objectType] = []
      acc[item.objectType].push(item)
      return acc
    }, {})

    // Process each type
    for (const [type, items] of Object.entries(itemsByType)) {
      // Get the actual data for each item
      const dataItems = await Promise.all(
        items.map(async (item) => {
          const data = await getItemById(item.objectType, item.objectId)
          return {
            syncItem: item,
            data,
          }
        }),
      )

      // Send to server
      const response = await fetch(`${apiEndpoint}/${type}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataItems),
      })

      if (!response.ok) {
        throw new Error(`Sync failed for ${type}: ${response.statusText}`)
      }

      // Update local items with server response if needed
      const result = await response.json()

      // Clear processed items from sync queue
      const transaction = db.transaction(STORES.syncQueue, "readwrite")
      const store = transaction.objectStore(STORES.syncQueue)

      for (const item of items) {
        store.delete(item.id)
      }
    }

    return { success: true, message: "Sync completed successfully" }
  } catch (error) {
    console.error("Sync error:", error)
    return { success: false, message: error.message }
  }
}

// Clear all data (for testing/development)
export async function clearAllData() {
  const db = await getDatabase()
  const transaction = db.transaction(Object.values(STORES), "readwrite")

  Object.values(STORES).forEach((storeName) => {
    transaction.objectStore(storeName).clear()
  })

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve({ success: true })
    }

    transaction.onerror = () => {
      reject(transaction.error)
    }
  })
}
