import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  share() {
    confirm('Enable Sharing the circuit will  become public');
  }

  closeProject() {
      const closeProject = document.getElementById('openproject');
      closeProject.style.display = 'none';
  }

  openProject() {
    const openProject = document.getElementById('openproject');
    openProject.style.display = 'block';
  }

  constructor() {

  }

  ngOnInit() {
  }

}
