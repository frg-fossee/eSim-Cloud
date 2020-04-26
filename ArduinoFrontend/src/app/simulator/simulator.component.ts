import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css']
})
export class SimulatorComponent implements OnInit {

  constructor(private aroute: ActivatedRoute) {
    // Stores all the Circuit Information
    window['scope'] = {
    };
    // True when simulation takes place
    window['isSimulating'] = false;
    // Stores the reference to the selected circuit component
    window['selected'] = null;
    // True when a component is selected
    window['isSelected'] = false;
  }

  ngOnInit() {
    this.aroute.queryParams.subscribe(v => {
      console.log(v);
    });
  }

}
