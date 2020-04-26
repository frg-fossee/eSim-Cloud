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
    // Global Function to Show Properties of Circuit Component
    window['showProperties'] = () => {

    };
    // Global Function to Hide Properties of Circuit Component
    window['hideProperties'] = () => {

    };
    // Global Function to show Popup Bubble
    window['showBubble'] = (label: string, x: number, y: number) => {

    };
    // Global Function to hide Popub Bubble
    window['hideBubble'] = () => {

    };
    // Global Function to show Toast Message
    window['showToast'] = (message: string) => {

    };
  }

  ngOnInit() {
    this.aroute.queryParams.subscribe(v => {
      console.log(v);
    });
  }

}
