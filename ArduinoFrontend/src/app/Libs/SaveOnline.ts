import { isNull } from 'util';
import { Login } from './Login';
import { Download, ImageType } from './Download';
import { ApiService } from '../api.service';
import { Workspace } from './Workspace';
import { AlertService } from '../alert/alert-service/alert.service';

/**
 * Declare window so that custom created function don't throw error
 */
declare var window;

/**
 * Class For Saving Online
 */
export class SaveOnline {
  /**
   * Check if input is an UUID.
   * @param input Input that needs to be tested
   */
  static isUUID(input: string) {
    const rgx = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return rgx.test(input);
  }
  /**
   * Save or Update Project
   * @param name Project Name
   * @param description Project Description
   * @param api API Service
   * @param callback Callback when save/update is done
   * @param id Project ID
   */
  static Save(name: string = '', description: string = '', api: ApiService, callback: (data: any) => void = null, id: string = null) {
    // Get Token
    const token = Login.getToken();
    if (token) {
      // if id is present then update
      let toUpdate = false;
      if (isNull(id)) {
      } else {
        toUpdate = true;
      }
      // Save Object that needs to send to server
      const saveObj = {
        data_dump: '',
        is_arduino: true,
        description,
        name,
      };
      // Data Dump will contain Workspace Data and Circuit data
      const dataDump = {
        canvas: {
          x: Workspace.translateX,
          y: Workspace.translateY,
          scale: Workspace.scale
        }
      };
      // For each item in scope
      for (const key in window.scope) {
        // if at least one component present in the scope
        if (window.scope[key] && window.scope[key].length > 0) {
          dataDump[key] = []; // Intialize datadump
          // Call the save function and push the return object
          for (const item of window.scope[key]) {
            if (item.save) {
              dataDump[key].push(item.save());
            }
          }

        }
      }
      // Convert Data Dump to an String and add to Save Object
      saveObj.data_dump = JSON.stringify(dataDump);

      // Generate Thumbnail for the project
      Download.ExportImage(ImageType.PNG).then(v => {
        saveObj['base64_image'] = v; // Store the base64 image

        // if update then update the project
        if (toUpdate) {
          api.updateProject(id, saveObj, token).subscribe(out => {
            if (callback) {
              callback(out);
            }
          }, err => {
            if (err.status === 401) {
              AlertService.showAlert('You Cannot Save the Circuit as you are not the Ownwer');
              return;
            }
            console.log(err);
          });
        } else {
          // Otherwise save the project
          api.saveProject(saveObj, token).subscribe(output => {
            if (callback) {
              callback(output);
            }
          }, err => {
            let message = '';
            for (const key in err.error) {
              if (err.error[key]) {
                message += '\n' + key;
                for (const item of err.error[key]) {
                  message += `${item},`;
                }
              }
            }
            AlertService.showAlert(message);
          });

        }

      });

    }

  }

}

