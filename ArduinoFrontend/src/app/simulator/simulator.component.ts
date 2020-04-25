import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css']
})
export class SimulatorComponent implements OnInit {

  constructor(private aroute: ActivatedRoute) { }

  ngOnInit() {
    this.aroute.queryParams.subscribe(v => {
      console.log(v);
    });
  }

}
