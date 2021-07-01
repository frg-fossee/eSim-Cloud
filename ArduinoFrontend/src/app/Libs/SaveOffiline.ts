import { AlertService } from '../alert/alert-service/alert.service';

/**
 * Declare window so that custom created function don't throw error
 */
declare var window;
/**
 * Class to Save Project in IndexedDB
 */
export class SaveOffline {
  /**
   * Check if IndexedDB exist if not show alert
   * @param callback If IndexedDB exist call the callback
   */
  static Check(callback: (result: any) => void = null) {
    // check db exist
    if (window.indexedDB) {
    } else {
      // support for other browser
      window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
      window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    }

    // if exist create/open project database
    if (window.indexedDB) {
      const request = window.indexedDB.open('projects', 1);
      // Database was not able to open/create
      request.onerror = (err) => {
        console.log(err);
        AlertService.showAlert('Error Occurred for Ofline Circuit (Private Window Can be a Reason)');
      };

      // if everything works call the callback with result
      request.onsuccess = () => {
        if (callback) {
          callback(request.result);
        }
      };
      // Create Object Store on success
      request.onupgradeneeded = (event) => {
        const datab = event.target.result;
        if (!datab.objectStoreNames.contains('projects')) {
          datab.createObjectStore('project', { keyPath: 'id' });
        }
      };

      return true;
    }

    // IndexedDB not found
    AlertService.showAlert('Save Offline Feature Will Not Work');
    return false;
  }
  /**
   * Save Project to Indexed DB
   * @param mydata Project Data
   * @param callback Callback if Project is saved
   */
  static Save(mydata, callback: (data: any) => void = null) {
    if (!SaveOffline.Check(db => {
      db.transaction(['project'], 'readwrite')
        .objectStore('project')
        .add(mydata);
      if (callback) {
        callback(mydata);
      }
      AlertService.showAlert('Done saved.');
    })) {
      return;
    }
    // let db;
    // const request = window.indexedDB.open('projects', 1);
    // request.onerror = () => {
    //   // console.log('error: ');
    //   alert('Error Occurred');
    // };

    // request.onsuccess = () => {
    //   db = request.result;
    // };

    // request.onupgradeneeded = (event) => {
    //   const datab = event.target.result;
    //   if (!datab.objectStoreNames.contains('projects')) {
    //     datab.createObjectStore('project', { keyPath: 'id' });
    //   }
    // };
  }

  /**
   * Read all Project from Indexed DB
   * @param callback Callback if after all the data is fetched
   */
  static ReadALL(callback: (data: any) => void = null) {
    if (!SaveOffline.Check(db => {
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
    })) {
      return;
    }
    // let db;
    // const request = window.indexedDB.open('projects', 1);
    // request.onerror = (event) => {
    //   // console.log('error: ');
    //   alert('Error Occurred');
    // };

    // request.onsuccess = () => {
    //   db = request.result;
    // console.log('success: ' + db);
    // };
  }
  /**
   * Delete Project Fron Indexed DB
   * @param id Project ID
   * @param callback Callback if it was deleted Succesfully
   */
  static Delete(id, callback: () => void = null) {
    if (!SaveOffline.Check(db => {
      const ok = db.transaction(['project'], 'readwrite')
        .objectStore('project')
        .delete(id);

      ok.onsuccess = (_) => {
        if (callback) {
          callback();
        }
      };
    })) {
      return;
    }
    // let db;
    // const request = window.indexedDB.open('projects', 1);
    // request.onerror = (_) => {
    //   // console.log('error: ');
    //   alert('Error Occurred');
    // };

    // request.onsuccess = (__) => {
    //   db = request.result;

    // };
  }
  /**
   * Update respective Project in Indexed DB
   * @param mydata Project data contains id
   * @param callback Callback when Project is succesfully updated
   */
  static Update(mydata, callback: (data: any) => void = null) {
    if (!SaveOffline.Check(db => {
      const ok = db.transaction(['project'], 'readwrite')
        .objectStore('project')
        .put(mydata);

      ok.onsuccess = (_) => {
        AlertService.showAlert('Done updating.');
        if (callback) {
          callback(mydata);
        }
      };
    })) {
      return;
    }
    // let db;
    // const request = window.indexedDB.open('projects', 1);
    // request.onerror = (_) => {
    //   alert('Error Occurred');
    //   // console.log('error: ');
    // };

    // request.onsuccess = (__) => {
    //   db = request.result;


    // };
  }
  /**
   * Read a Particular project from Indexed DB
   * @param id Project ID
   * @param callback Callback if Project read is completed
   */
  static Read(id, callback: (data: any) => void = null) {
    if (!SaveOffline.Check(db => {
      const transaction = db.transaction(['project']);
      const objectStore = transaction.objectStore('project');
      const ok = objectStore.get(parseInt(id, 10));

      ok.onerror = () => {
        AlertService.showAlert('Unable to retrieve data from database!');
        callback(null);
      };

      ok.onsuccess = () => {
        callback(ok.result);
      };
    })) {
      return;
    }
    // let db;
    // const request = window.indexedDB.open('projects', 1);
    // request.onerror = () => {
    //   alert('Error Occurred');
    //   // console.log('error: ');
    // };

    // request.onsuccess = () => {
    // db = request.result;


    // };
  }
}
