// IndexedDB wrapper — 画像の永続保存用
const DB_NAME = 'nutriguide_db';
const DB_VERSION = 1;
let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('materials')) {
        const store = db.createObjectStore('materials', { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
      }
      if (!db.objectStoreNames.contains('meal_images')) {
        db.createObjectStore('meal_images', { keyPath: 'id' });
      }
    };
    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror = e => reject(e.target.error);
  });
}

function tx(storeName, mode, fn) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const t = db.transaction(storeName, mode);
      const store = t.objectStore(storeName);
      const req = fn(store);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}

// ─── 説明用資料 ───
export function saveMaterial(mat) {
  return tx('materials', 'readwrite', s => s.put(mat));
}

export function getMaterial(id) {
  return tx('materials', 'readonly', s => s.get(id));
}

export function getAllMaterials() {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const t = db.transaction('materials', 'readonly');
      const req = t.objectStore('materials').getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}

export function deleteMaterial(id) {
  return tx('materials', 'readwrite', s => s.delete(id));
}

// ─── 食事記録の画像 ───
export function saveMealImage(obj) {
  return tx('meal_images', 'readwrite', s => s.put(obj));
}

export function getMealImage(id) {
  return tx('meal_images', 'readonly', s => s.get(id));
}

export function deleteMealImage(id) {
  return tx('meal_images', 'readwrite', s => s.delete(id));
}

// ─── ファイル → DataURL変換 ───
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── 画像を圧縮してリサイズ（最大1200px / quality 0.85）───
export function compressImage(file, maxPx = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
    };
    img.src = url;
  });
}
