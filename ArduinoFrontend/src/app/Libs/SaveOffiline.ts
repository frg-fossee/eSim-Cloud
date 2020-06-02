declare var window;

export class SaveOffline {
  static Check() {
    if (window.indexedDB) {
      return true;
    }
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    if (window.indexedDB) {
      return true;
    }
    // IndexedDB not found
    alert('Save Offline Feature Will Not Work');
    return false;
  }
  static Save(mydata, callback: any = null) {
    if (!SaveOffline.Check()) {
      return;
    }
    let db;
    const request = window.indexedDB.open('projects', 1);
    request.onerror = () => {
      // console.log('error: ');
      alert('Error Occurred');
    };

    request.onsuccess = () => {
      db = request.result;
      db.transaction(['project'], 'readwrite')
        .objectStore('project')
        .add(mydata);
      if (callback) {
        callback(mydata);
      }
      alert('Done Saved');
    };

    request.onupgradeneeded = (event) => {
      const datab = event.target.result;
      if (!datab.objectStoreNames.contains('projects')) {
        datab.createObjectStore('project', { keyPath: 'id' });
      }
    };
  }


  static ReadALL(callback: any = null) {
    if (!SaveOffline.Check()) {
      return;
    }
    let db;
    const request = window.indexedDB.open('projects', 1);
    request.onerror = (event) => {
      // console.log('error: ');
      alert('Error Occurred');
    };

    request.onsuccess = () => {
      db = request.result;
      // console.log('success: ' + db);
      const objectStore = db.transaction('project').objectStore('project');
      const data = [];
      objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          data.push(cursor.value);
          cursor.continue();
        } else {
          if (callback) {
            callback(data);
          }
        }
      };
    };
  }

  static Delete(id, callback: any = null) {
    if (!SaveOffline.Check()) {
      return;
    }
    let db;
    const request = window.indexedDB.open('projects', 1);
    request.onerror = (_) => {
      // console.log('error: ');
      alert('Error Occurred');
    };

    request.onsuccess = (__) => {
      db = request.result;

      const ok = db.transaction(['project'], 'readwrite')
        .objectStore('project')
        .delete(id);

      ok.onsuccess = (_) => {
        alert('Done Deleting');
        if (callback) {
          callback();
        }
      };
    };
  }

  static Update(mydata, callback: any = null) {
    if (!SaveOffline.Check()) {
      return;
    }
    let db;
    const request = window.indexedDB.open('projects', 1);
    request.onerror = (_) => {
      alert('Error Occurred');
      // console.log('error: ');
    };

    request.onsuccess = (__) => {
      db = request.result;

      const ok = db.transaction(['project'], 'readwrite')
        .objectStore('project')
        .put(mydata);

      ok.onsuccess = (_) => {
        alert('Done Updating');
        if (callback) {
          callback(mydata);
        }
      };

    };
  }

  static Read(id, callback: any = null) {
    if (!SaveOffline.Check()) {
      return;
    }
    let db;
    const request = window.indexedDB.open('projects', 1);
    request.onerror = () => {
      alert('Error Occurred');
      // console.log('error: ');
    };

    request.onsuccess = () => {
      db = request.result;

      const transaction = db.transaction(['project']);
      const objectStore = transaction.objectStore('project');
      const ok = objectStore.get(parseInt(id, 10));

      ok.onerror = () => {
        alert('Unable to retrieve data from database!');
      };

      ok.onsuccess = () => {
        callback(ok.result);
      };

    };
  }
}
