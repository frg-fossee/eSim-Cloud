import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AlertService } from '../alert/alert-service/alert.service';
import { ApiService } from '../api.service';
import { GraphComponent } from '../graph/graph.component';
import { Login } from '../Libs/Login';
import { Workspace } from '../Libs/Workspace';

@Component({
  selector: 'app-graphlist',
  templateUrl: './graphlist.component.html',
  styleUrls: ['./graphlist.component.css']
})
export class GraphlistComponent implements OnInit {

  @Input() id: number;
  @ViewChildren('pinGraph') graphList!: QueryList<GraphComponent>
  nodes: Object[] = [];
  simulationStatus: boolean = false;

  constructor(private api: ApiService) { }

  readPins() {
    console.log('Detecting changes');
    this.nodes = [];
    // Workspace.circuitLoadStatus.subscribe(_ => {
      window['scope'].ArduinoUno.forEach(arduino => {
        arduino.nodes.forEach(point => {
          if (point.connectedTo && (point.id <= 13 && point.id >= 2)) {
            this.nodes.push({point: point.id, arduinoId: arduino.id, arduinoName: arduino.name});
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
    Workspace.circuitLoadStatus.subscribe(res => {
      this.readPins();
    })
    document.addEventListener('changed', (r) => {
      console.log('Detecting changes', r);
    });
  }

  SaveData() {
    console.log("Clicked");
    let data = {};
    this.graphList.forEach(pinGraph => {
      data[pinGraph.pinLabel] = {
        values: pinGraph.data,
        delay: pinGraph.xlabels,
        length: pinGraph.data.length,
      }
    });
    const token = Login.getToken();
    console.log(data);
    this.api.storeSimulationData(this.id, token, data).subscribe(res => AlertService.showAlert("Record Saved Successfully")
    , err => AlertService.showAlert(err));
  }

}
