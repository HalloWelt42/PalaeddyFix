import type { AnalysisResult, StoredImage } from "./schema";

const DB_NAME = "palaeddyfix";
const DB_VERSION = 1;
const STORE_IMAGES = "images";
const STORE_ANALYSES = "analyses";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        const images = db.createObjectStore(STORE_IMAGES, { keyPath: "id" });
        images.createIndex("createdAt", "createdAt");
        images.createIndex("pinned", "pinned");
      }
      if (!db.objectStoreNames.contains(STORE_ANALYSES)) {
        const analyses = db.createObjectStore(STORE_ANALYSES, { keyPath: "key" });
        analyses.createIndex("imageId", "imageId");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("IndexedDB blockiert"));
  });
  return dbPromise;
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(store, mode);
        const os = transaction.objectStore(store);
        const req = run(os);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

function txCursor<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<IDBCursorWithValue | null> | void,
  collect: (cursor: IDBCursorWithValue) => void,
  done: () => T,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(store, mode);
        const os = transaction.objectStore(store);
        run(os);
        transaction.oncomplete = () => resolve(done());
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      }),
  );
}

export async function putImage(img: StoredImage): Promise<void> {
  await tx(STORE_IMAGES, "readwrite", (s) => s.put(img));
}

export async function getImage(id: string): Promise<StoredImage | undefined> {
  return tx<StoredImage | undefined>(STORE_IMAGES, "readonly", (s) => s.get(id));
}

export async function deleteImage(id: string): Promise<void> {
  await tx(STORE_IMAGES, "readwrite", (s) => s.delete(id));
  await deleteAnalysesFor(id);
}

export async function listImages(): Promise<StoredImage[]> {
  const items: StoredImage[] = [];
  return txCursor<StoredImage[]>(
    STORE_IMAGES,
    "readonly",
    (s) => {
      const req = s.index("createdAt").openCursor(null, "prev");
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          items.push(cursor.value as StoredImage);
          cursor.continue();
        }
      };
    },
    () => {},
    () => items,
  );
}

export async function setPinned(id: string, pinned: boolean): Promise<void> {
  const img = await getImage(id);
  if (!img) return;
  img.pinned = pinned;
  await putImage(img);
}

export async function storageUsage(): Promise<{ used: number; quota: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    return { used: est.usage ?? 0, quota: est.quota ?? 0 };
  }
  return { used: 0, quota: 0 };
}

export function analysisKey(imageId: string, colorCount: number): string {
  return `${imageId}:${colorCount}`;
}

export async function putAnalysis(a: AnalysisResult): Promise<void> {
  await tx(STORE_ANALYSES, "readwrite", (s) => s.put(a));
}

export async function getAnalysis(
  imageId: string,
  colorCount: number,
): Promise<AnalysisResult | undefined> {
  return tx<AnalysisResult | undefined>(STORE_ANALYSES, "readonly", (s) =>
    s.get(analysisKey(imageId, colorCount)),
  );
}

async function deleteAnalysesFor(imageId: string): Promise<void> {
  const keys: IDBValidKey[] = [];
  await txCursor(
    STORE_ANALYSES,
    "readonly",
    (s) => {
      const req = s.index("imageId").openCursor(IDBKeyRange.only(imageId));
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          keys.push(cursor.primaryKey);
          cursor.continue();
        }
      };
    },
    () => {},
    () => {},
  );
  if (keys.length === 0) return;
  await openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const t = db.transaction(STORE_ANALYSES, "readwrite");
        const s = t.objectStore(STORE_ANALYSES);
        for (const k of keys) s.delete(k as IDBValidKey);
        t.oncomplete = () => resolve();
        t.onerror = () => reject(t.error);
      }),
  );
}

export async function clearAll(): Promise<void> {
  await tx(STORE_IMAGES, "readwrite", (s) => s.clear());
  await tx(STORE_ANALYSES, "readwrite", (s) => s.clear());
}
