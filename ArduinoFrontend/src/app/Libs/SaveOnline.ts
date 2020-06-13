import { isNull } from 'util';
import { Login } from './Login';
import { Download, ImageType } from './Download';
import { ApiService } from '../api.service';
import { Workspace } from './Workspace';

declare var window;

export class SaveOnline {
  static isUUID(input: string) {
    const rgx = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return rgx.test(input);
  }
  static Save(name: string = '', description: string = '', api: ApiService, callback: any = null, id: string = null) {
    const token = Login.getToken();
    if (token) {
      let toUpdate = false;
      if (isNull(id)) {
      } else {
        toUpdate = true;
      }
      const saveObj = {
        data_dump: '',
        is_arduino: true,
        description,
        name,
      };
      const dataDump = {
        canvas: {
          x: Workspace.translateX,
          y: Workspace.translateY,
          scale: Workspace.scale
        }
      };
      for (const key in window.scope) {
        if (window.scope[key] && window.scope[key].length > 0) {
          dataDump[key] = [];
          for (const item of window.scope[key]) {
            if (item.save) {
              dataDump[key].push(item.save());
            }
          }
        }
      }
      saveObj.data_dump = JSON.stringify(dataDump);
      Download.ExportImage(ImageType.PNG).then(v => {
        saveObj['base64_image'] = v;
        if (toUpdate) {
          api.updateProject(id, saveObj, token).subscribe(out => {
            if (callback) {
              callback(out);
            }
          }, err => {
            console.log(err);
          });
        } else {
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
            alert(message);
          });
        }
      });
    }
  }
}

