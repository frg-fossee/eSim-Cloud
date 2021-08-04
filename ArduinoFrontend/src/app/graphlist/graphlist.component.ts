import { Component, OnInit } from '@angular/core';
import { resolveComponentResources } from '@angular/core/src/metadata/resource_loading';
import { Workspace } from '../Libs/Workspace';

@Component({
  selector: 'app-graphlist',
  templateUrl: './graphlist.component.html',
  styleUrls: ['./graphlist.component.css']
})
export class GraphlistComponent implements OnInit {

  nodes: string[] = [];
  simulationStatus: boolean = false;

  constructor() { }

  ngOnInit() {
    if (Workspace.circuitLoaded) {
      window['scope'].ArduinoUno.forEach(arduino => {
        arduino.nodes.forEach(point => {
          if (point.connectedTo) {
            this.nodes.push(point.id);
          }
        });
      });
    }
    Workspace.simulationStarted.subscribe(res => this.simulationStatus = res)
    Workspace.simulationStopped.subscribe(res => this.simulationStatus = res);
  }

}
