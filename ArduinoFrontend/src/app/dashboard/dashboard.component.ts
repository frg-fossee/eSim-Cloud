import { Component, OnInit, Input } from '@angular/core';
import { SaveOffline } from '../Libs/SaveOffiline';
import { ApiService } from '../api.service';
import { Login } from '../Libs/Login';
import { MatSnackBar } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material';
import { environment } from 'src/environments/environment';
import { AlertService } from '../alert/alert-service/alert.service';

/**
 * For Handling Time ie. Prevent moment error
 */
declare var moment;

/**
 * Class for Dashboard page
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  /**
   * List of Offline Circuits
   */
  items: any[] = [];
  /**
   * Selected Circuit required for popup
   */
  selected: any = {};
  /**
   * List of Online Circuits
   */
  online: any[] = [];
  /**
   * Message shown to user if something happens while fetching online circuits
   */
  onCloudMessage = 'No Online Circuits Available &#9785;';
  /**
   * Variable to tell if it is production build
   */
  isProd = environment.production;
  /**
   * Close Project Properties dialog
   */
  closeProject() {
    document.documentElement.style.overflow = 'auto';
    const closeProject = document.getElementById('openproject');
    closeProject.style.display = 'none';
  }
  /**
   * Open Project in the simulator
   * @param id Project Id
   * @param offline Is Offline circuit boolean
   */
  openProject(id, offline = false) {
    // Select the clicked item
    if (offline) {
      this.selected = this.items[id];
    } else {
      this.selected = this.online[id];
    }
    this.selected.index = id;
    // Show Project Properties Dialog
    document.documentElement.style.overflow = 'hidden';
    const openProject = document.getElementById('openproject');
    openProject.style.display = 'block';
  }
  /**
   * Constructor for Dashboard page
   * @param api API Service
   * @param snackbar Material Snackbar
   * @param title Document Title
   */
  constructor(private api: ApiService, private snackbar: MatSnackBar, private title: Title, private alertService: AlertService) {
    this.title.setTitle('Dashboard | Arduino On Cloud');
  }
  /**
   * On Init Dashboard Page
   */
  ngOnInit() {
    // Read All Offline Project
    SaveOffline.ReadALL((v: any[]) => {
      // Map Offline Project to standard card item
      this.items = v.map(item => {
        return {
          name: item.project.name,
          description: item.project.description,
          create_time: item.project.created_at,
          save_time: item.project.updated_at,
          base64_image: item.project.image,
          save_id: item.id,
          offline: true
        };
      });
    });

    // Get Login token
    const token = Login.getToken();
    // if token is present get the list of project created by a user
    if (token) {
      this.api.listProject(token).subscribe((val: any[]) => {
        this.online = val;
      }, err => console.log(err));
    } else {
      // if no token is present then show this message
      this.onCloudMessage = 'Please Login to See Circuit';
    }
  }

  /**
   * Function to call when user confirms the ciruit deletion
   * @param id Project id
   * @param offline Is Offline Circuit
   * @param index Project's index in their list
   */
  private deleteCircuitConfirm(id, offline, index) {
    // Show loading animation
    window['showLoading']();

    // if project is offline delete from indexDB
    if (offline) {
      SaveOffline.Delete(id, () => {
        this.items.splice(index, 1);
        this.closeProject();
        AlertService.showAlert('Done Deleting');
        window['hideLoading']();
      });
    } else {
      // Delete Project from cloud
      const token = Login.getToken();
      this.api.deleteProject(id, token).subscribe((out) => {
        if (out.done) {
          // Remove From the list
          this.online.splice(index, 1);
        } else {
          AlertService.showAlert('Something went wrong');
        }
        this.closeProject();
        window['hideLoading']();
      }, err => {
        AlertService.showAlert('Something went wrong');
        window['hideLoading']();
        console.log(err);
      });
    }
  }

  /**
   * Delete the Project from Database
   * @param id Project id
   * @param offline Is Offline Circuit
   * @param index Project's index in their list
   */
  DeleteCircuit(id, offline, index) {
    // ASK for user confirmation
    AlertService.showConfirm('Are You Sure You want to Delete Circuit', () => this.deleteCircuitConfirm(id, offline, index));
  }

  /**
   * Disanle Project Sharing
   * @param item Project Card Object
   */
  DisableSharing(item: any) {
    const token = Login.getToken();
    this.EnableSharing(item.save_id, token, (v) => {
      item.shared = v.shared;
      AlertService.showAlert('Sharing Disabled!');
    }, false);
  }
  /**
   * Returns a time difference from now in a string
   * @param item Project card Object
   * @param time Project time (create/update)
   */
  DateDiff(item: any, time) {
    item.time = moment(time).fromNow();
  }
  /**
   * Returns complete date in meaningfull format
   * @param item Project Card Object
   */
  ExpandDate(item) {
    item.create = moment(item.create_time).format('LLLL');
    item.edit = moment(item.save_time).format('LLLL');
  }
  /**
   * Search Circuit from cloud
   * @param input Html Input Box
   */
  SearchCircuits(input: HTMLInputElement) {
    const token = Login.getToken();
    if (token) {
      if (input.value === '') {
        this.api.listProject(token).subscribe((val: any[]) => {
          this.online = val;
        }, err => console.log(err));
        return;
      }

      this.api.searchProject(input.value, token).subscribe((out: any[]) => {
        console.log(out);
        this.online = out;
      }, err => {
        AlertService.showAlert('Something went wrong');
        console.log(err);
      });
    } else {
      AlertService.showAlert('Please Login!');
    }
  }
  /**
   * Copy respective url to clipboard for sharing
   * @param url URL that need to be copy
   */
  CopyUrlToClipBoard(url) {
    // Create a temp html element put url inside it
    const tmpEl = document.createElement('textarea');
    tmpEl.value = url;
    document.body.appendChild(tmpEl);
    // Focus and Select the element
    tmpEl.focus();
    tmpEl.select();
    // exec copu command
    const done = document.execCommand('copy');
    // if not able to copy show alert with url else show user a snackbar
    if (!done) {
      AlertService.showAlert('Not able to Copy ' + tmpEl.value);
    } else {
      this.snackbar.open('Copied', null, {
        duration: 2000
      });
    }
    // Remove the temp element
    document.body.removeChild(tmpEl);
  }
  /**
   * Project to enable or disable sharing (default enable)
   * @param id Project id
   * @param token Auth Token
   * @param callback Callback when done
   * @param enable Enable/Disable sharing
   */
  EnableSharing(id, token, callback: any, enable: boolean = true) {
    this.api.Sharing(id, enable, token).subscribe((v) => {
      callback(v);
    }, err => {
      if (err.status === 401) {
        console.log('You are not the Owner');
        return;
      }
      console.log(err);
    });
  }
  /**
   * Share Project button click event handler
   * @param selected Selected Project Card Object
   * @param index Type of Sharing
   */
  ShareCircuit(selected, index) {
    /**
     * index
     * 0 -> FB
     * 1 -> LinkedIN
     * 2 -> Reddit
     * 3 -> Mail
     * 4 -> copy url
     */

    // Get token if logged in
    const token = Login.getToken();
    if (!token) {
      AlertService.showAlert('Please Login');
      return;
    }


    this.snackbar.open('Anyone With The Link Can View and Simulate Project But cannot edit.', 'Close', {
      duration: 10000
    });
    // Create a Slug
    const slug = `${selected.save_id.replace(/-/g, '_')}-${selected.name.substr(0, 50).replace(/ +/g, '-')}`;
    // redirect to share url
    let shareURL = `${window.location.protocol}\\\\${window.location.host}/arduino/#/project/${slug} `;
    const copyUrl = shareURL;
    // encode url for redirect
    shareURL = encodeURIComponent(shareURL);
    // Sharing title
    const sharingName = encodeURIComponent(`${selected.name} | Arduino On Cloud`);

    if (index < 3) {
      // Map of sharing url of each website
      const map = [
        `https://www.facebook.com/sharer/sharer.php?u=${shareURL}`,
        `https://www.linkedin.com/sharing/share-offsite/?url=${shareURL}`,
        `http://www.reddit.com/submit?url=${shareURL}&title=${sharingName}`
      ];
      // if project is already shared then open link
      if (selected.shared) {
        window.open(map[index], '_blank');
      } else {
        // otherwise enable sharing and open the link in new tab
        this.EnableSharing(selected.save_id, token, (v) => {
          selected.shared = v.shared;
          if (selected.shared) {
            window.open(map[index], '_blank');
          } else {
            AlertService.showAlert('Not Able to Share Circuit');
          }
        });
      }
    } else if (index === 3) {
      // Send email
      const description = encodeURI(`${selected.description}\n\n\n\n\nVisit `);
      const back = `subject=${sharingName}&body=${description}${shareURL}`;
      if (selected.shared) {
        window.open(`mailto:?${back}`, '_blank');
      } else {
        this.EnableSharing(selected.save_id, token, (v) => {
          selected.shared = v.shared;
          if (selected.shared) {
            window.open(`mailto:?${back}`, '_blank');
          } else {
            AlertService.showAlert('Not Able to Share Circuit');
          }
        });
      }
    } else if (index === 4) {
      // Copy sharing url to clipboard if sharing is on
      if (selected.shared) {
        this.CopyUrlToClipBoard(copyUrl);
      } else {
        // other wise enable share and copy the url
        this.EnableSharing(selected.save_id, token, (v) => {
          selected.shared = v.shared;
          if (selected.shared) {
            this.CopyUrlToClipBoard(copyUrl);
          } else {
            AlertService.showAlert('Not Able to Share Circuit');
          }
        });
      }
    }
  }
}
