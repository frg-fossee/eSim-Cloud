import { Component, OnInit } from '@angular/core';
import { SaveOffline } from '../Libs/SaveOffiline';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  items: any[] = [];
  selected: any = {};

  share() {
    confirm('Enable Sharing the circuit will  become public');
  }

  closeProject() {
    const closeProject = document.getElementById('openproject');
    closeProject.style.display = 'none';
  }

  openProject(id) {
    // console.log(id);
    for (const item of this.items) {
      if (item.id === id) {
        this.selected = item;
        break;
      }
    }
    const openProject = document.getElementById('openproject');
    openProject.style.display = 'block';
  }

  constructor() {

  }
  ngOnInit() {
    SaveOffline.ReadALL((v) => {
      console.log(v);
      this.items = v;
    });
  }
  DeleteCircuit(id) {
    console.log(id);
    SaveOffline.Delete(id, () => {
      window.location.reload();
    });
  }
}
