import { Component, OnInit } from '@angular/core';
import { SaveOffline } from '../Libs/SaveOffiline';
import { ApiService } from '../api.service';
import { Login } from '../Libs/Login';

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
  share() {
    confirm('Enable Sharing the circuit will  become public');
  }

  closeProject() {
    const closeProject = document.getElementById('openproject');
    closeProject.style.display = 'none';
  }

  openProject(id, offline = false) {
    console.log(offline);
    // for (const item of this.items) {
    //   if (item.id === id) {
    if (offline) {
      this.selected = this.items[id];
    } else {
      this.selected = this.online[id];
    }
    //     break;
    //   }
    // }
    const openProject = document.getElementById('openproject');
    openProject.style.display = 'block';
  }

  constructor(private api: ApiService) {
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
        console.log(val);
        this.online = val;
        console.log(this.online);
      }, err => console.log(err));
    }
  }
  DeleteCircuit(id, offline, index) {
    window['showLoading']();
    if (offline) {
      SaveOffline.Delete(id, () => {
        this.items.splice(index, 1);
        this.closeProject();
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
  DateDiff(item: any, time) {
    item.time = moment(time).fromNow();
  }
  ExpandDate(item) {
    item.create = moment(item.create_time).format('LLLL');
    item.edit = moment(item.save_time).format('LLLL');
  }
  CalcTimeDifference() {

  }
}
