import { Component, OnInit } from '@angular/core';
import { resolveComponentResources } from '@angular/core/src/metadata/resource_loading';
import { Workspace } from '../Libs/Workspace';

@Component({
  selector: 'app-graphlist',
  templateUrl: './graphlist.component.html',
  styleUrls: ['./graphlist.component.css']
})
export class GraphlistComponent implements OnInit {

  nodes: Object[] = [];
  simulationStatus: boolean = false;

  constructor() { }

  readPins() {
    this.nodes = [];
    // Workspace.circuitLoadStatus.subscribe(_ => {
      window['scope'].ArduinoUno.forEach(arduino => {
        arduino.nodes.forEach(point => {
          if (point.connectedTo && (point.id <= 13 && point.id >= 2)) {
            this.nodes.push({point: point.id, arduino: arduino.id});
          }
        });
      });
    // });
  }

  ngOnInit() {
    Workspace.simulationStarted.subscribe(res => {
      this.simulationStatus = res;
    });
    Workspace.simulationStopped.subscribe(res => {
      this.simulationStatus = res;
    });
    this.readPins();
  }

}
