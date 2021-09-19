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
      console.log('Detecting changes', r['detail']['ele']['element']);
      let changeInfo = r['detail']['ele'];
      if (changeInfo.keyName === 'wires') {
        let wire = changeInfo['element'];
        let SarduinoId = wire['start']['keyName'] === 'ArduinoUno' ? wire.start.id : undefined;
        let EarduinoId = wire['end']['keyName'] === 'ArduinoUno' ? wire.end.id : undefined;
        if (changeInfo.event === 'delete') {
          this.nodes = this.nodes.filter(i => {
            if(SarduinoId && i['arduinoId'] === SarduinoId) {
              if(i['point'] === wire.start.pid) {
                return false;
              }
            }
            if (EarduinoId && i['arduinoId'] === EarduinoId) {
              if(i['point'] === wire.end.pid) {
                return false;
              }
            }
            return true;
          });
          console.log(this.nodes);
        } else if(changeInfo.event === 'add') {
          let Sarduino = SarduinoId ? window['scope'].ArduinoUno.filter(arduino => arduino.id === wire.start.id)[0]: undefined;
          let Earduino = EarduinoId ? window['scope'].ArduinoUno.filter(arduino => arduino.id === wire.end.id)[0]: undefined;
          this.pushPoint(Sarduino, wire.start.pid);
          this.pushPoint(Earduino, wire.end.pid);
        }
      }
    });
  }

  pushPoint(arduino, pointId) {
    if(arduino) {
      let point = arduino['nodes'][pointId];
      if (point.connectedTo && (point.id <= 13 && point.id >= 2)) {
        this.nodes.push({point: point.id, arduinoId: arduino.id, arduinoName: arduino.name});
      }
    }
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
