import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.css']
})
export class ViewProjectComponent implements OnInit {

  constructor(private aroute: ActivatedRoute) { }
  ngOnInit() {
    this.aroute.paramMap.subscribe((v) => {
      console.log(v);
    });
  }

}
