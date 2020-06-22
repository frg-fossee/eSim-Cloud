import { Component, OnInit, Input } from '@angular/core';
import { SaveOffline } from '../Libs/SaveOffiline';
import { ApiService } from '../api.service';
import { Login } from '../Libs/Login';
import { MatSnackBar } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material';
import { ProjectComponent } from '../project/project.component';
declare var moment;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  items: any[] = [];
  selected: any = {};
  online: any[] = [];
  onCloudMessage = 'No Online Circuits Available &#9785;';

  closeProject() {
    const closeProject = document.getElementById('openproject');
    closeProject.style.display = 'none';
  }

  openProject(id, offline = false) {
    // for (const item of this.items) {
    //   if (item.id === id) {
    if (offline) {
      this.selected = this.items[id];
    } else {
      this.selected = this.online[id];
    }
    this.selected.index = id;
    //     break;
    //   }
    // }
    const openProject = document.getElementById('openproject');
    openProject.style.display = 'block';
    /** Function open Projecties Properties on selecting card on Dashboard */
    /*const project =this.dialog.open(ProjectComponent,{
      width: '70%',
      minHeight: '800px'
    });*/
  }

  constructor(private api: ApiService, private snackbar: MatSnackBar, private title: Title, public dialog: MatDialog) {
    this.title.setTitle('Dashboard | Arduino On Cloud');
  }
  ngOnInit() {
    SaveOffline.ReadALL((v: any[]) => {
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
    const token = Login.getToken();
    if (token) {
      this.api.listProject(token).subscribe((val: any[]) => {
        // console.log(val);
        this.online = val;
        // console.log(this.online);
      }, err => console.log(err));
    } else {
      this.onCloudMessage = 'Please Login to See Circuit';
    }
  }
  DeleteCircuit(id, offline, index) {
    const ok = confirm('Are You Sure You want to Delete Circuit');
    if (!ok) {
      return;
    }
    window['showLoading']();
    if (offline) {
      SaveOffline.Delete(id, () => {
        this.items.splice(index, 1);
        this.closeProject();
        alert('Done Deleting');
        window['hideLoading']();
      });
    } else {
      const token = Login.getToken();
      this.api.deleteProject(id, token).subscribe((out) => {
        if (out.done) {
          this.online.splice(index, 1);
        } else {
          alert('Something went wrong');
        }
        this.closeProject();
        window['hideLoading']();
      }, err => {
        alert('Something went wrong');
        window['hideLoading']();
        console.log(err);
      });
    }

  }
  DisableSharing(item: any) {
    const token = Login.getToken();
    this.EnableSharing(item.save_id, token, (v) => {
      item.shared = v.shared;
      alert('Sharing Disabled!');
    }, false);
  }
  DateDiff(item: any, time) {
    item.time = moment(time).fromNow();
  }
  ExpandDate(item) {
    item.create = moment(item.create_time).format('LLLL');
    item.edit = moment(item.save_time).format('LLLL');
  }
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
        alert('Something went wrong');
        console.log(err);
      });
    } else {
      alert('Please Login!');
    }
  }
  CopyUrlToClipBoard(url) {
    const tmpEl = document.createElement('textarea');
    tmpEl.value = url;
    document.body.appendChild(tmpEl);
    tmpEl.focus();
    tmpEl.select();
    const done = document.execCommand('copy');
    if (!done) {
      alert('Not able to Copy ' + tmpEl.value);
    } else {
      this.snackbar.open('Copied', null, {
        duration: 2000
      });
    }
    document.body.removeChild(tmpEl);
  }

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

  ShareCircuit(selected, index) {
    const token = Login.getToken();
    if (!token) {
      alert('Please Login');
      return;
    }
    /**
     * index
     * 0 -> FB
     * 1 -> LinkedIN
     * 2 -> Reddit
     * 3 -> Mail
     * 4 -> copy url
     */
    this.snackbar.open('Anyone With The Link Can View and Simulate Project But cannot edit.', 'Close', {
      duration: 10000
    });
    const slug = `${selected.save_id.replace(/-/g, '_')}-${selected.name.substr(0, 50).replace(/ +/g, '-')}`;
    let shareURL = `${window.location.protocol}\\\\${window.location.host}/arduino/#/project/${slug} `;
    const copyUrl = shareURL;
    shareURL = encodeURIComponent(shareURL);

    const sharingName = encodeURIComponent(`${selected.name} | Arduino On Cloud`);
    if (index < 3) {
      const map = [
        `https://www.facebook.com/sharer/sharer.php?u=${shareURL}`,
        `https://www.linkedin.com/sharing/share-offsite/?url=${shareURL}`,
        `http://www.reddit.com/submit?url=${shareURL}&title=${sharingName}`
      ];
      if (selected.shared) {
        window.open(map[index], '_blank');
      } else {
        this.EnableSharing(selected.save_id, token, (v) => {
          selected.shared = v.shared;
          if (selected.shared) {
            window.open(map[index], '_blank');
          } else {
            alert('Not Able to Share Circuit');
          }
        });
      }
    } else if (index === 3) {
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
            alert('Not Able to Share Circuit');
          }
        });
      }
    } else if (index === 4) {
      if (selected.shared) {
        this.CopyUrlToClipBoard(copyUrl);
      } else {
        this.EnableSharing(selected.save_id, token, (v) => {
          selected.shared = v.shared;
          if (selected.shared) {
            this.CopyUrlToClipBoard(copyUrl);
          } else {
            alert('Not Able to Share Circuit');
          }
        });
      }
    }
  }
}
