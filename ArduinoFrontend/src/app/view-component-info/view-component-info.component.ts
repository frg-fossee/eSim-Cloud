import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-component-info',
  templateUrl: './view-component-info.component.html',
  styleUrls: ['./view-component-info.component.css']
})
export class ViewComponentInfoComponent implements OnInit {
  data = {
    name: '',
    desctiption: ''
  };

  constructor() { }

  ngOnInit() {
  }

}
