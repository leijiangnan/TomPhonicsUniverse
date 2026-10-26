// Web Locks on secure origins; IndexedDB read/write transactions serialize
// localStorage commits on LAN HTTP as well. Every app writer uses this gate.
export async function withSaveLock<T>(commit: () => T): Promise<T> {
  if (navigator.locks)
    return navigator.locks.request("tom-phonics-save", commit);
  return new Promise<T>((resolve, reject) => {
    const request = indexedDB.open("tom-phonics-write-gate", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("gate");
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Save gate unavailable"));
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("gate", "readwrite");
      let result: T;
      tx.objectStore("gate").get("lock").onsuccess = () => {
        try {
          result = commit();
        } catch (error) {
          tx.abort();
          reject(error);
        }
      };
      tx.oncomplete = () => {
        db.close();
        resolve(result);
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error ?? new Error("Save cancelled"));
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    };
  });
}
