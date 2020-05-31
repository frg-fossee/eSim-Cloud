import { Component, OnInit } from '@angular/core';
import { Workspace } from '../Libs/Workspace';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
<<<<<<< HEAD

  constructor() { }

=======
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
>>>>>>> master
  ngOnInit() {
    Workspace.readAll((v) => {
      console.log(v);
      this.items = v;
    });
  }
  DeleteCircuit(id) {
    console.log(id);
    Workspace.DeleteIDB(id, () => {
      window.location.reload();
    });
  }
}
