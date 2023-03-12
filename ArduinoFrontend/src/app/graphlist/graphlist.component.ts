import { Component, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventEmitter } from '@angular/core';
import { AlertService } from '../alert/alert-service/alert.service';
import { ApiService } from '../api.service';
import { GraphComponent } from '../graph/graph.component';
import { Login } from '../Libs/Login';
import { Workspace } from '../Libs/Workspace';
import { SimulatorComponent } from '../simulator/simulator.component';
import { GraphDataService } from '../graph-data.service';

@Component({
  selector: 'app-graphlist',
  templateUrl: './graphlist.component.html',
  styleUrls: ['./graphlist.component.css']
})
export class GraphlistComponent implements OnInit {

  @Input() id: number;
  @Input() saveId: any;
  @Input() lti: boolean;
  @Output() simDataSave: EventEmitter<boolean> = new EventEmitter();
  @ViewChildren('pinGraph') graphList!: QueryList<GraphComponent>;
  nodes: object[] = [];
  arduinoList: object[] = [];
  simulationStatus = false;
  dataPoints = 0;
  hexData: number[] = [];
  initData = false;

  constructor(
    private router: Router,
    private aroute: ActivatedRoute,
    private api: ApiService) { }

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
    window['scope'].ArduinoUno.forEach(arduino => {
      this.arduinoList.push({arduinoId: arduino.id, arduinoName: arduino.name});
    });
    // });
  }

  ngOnInit() {
    Workspace.simulationStarted.subscribe(res => {
      this.simulationStatus = res;
      this.dataPoints = 0;
      this.hexData = [];
      this.hexData.push(0);
      this.initData = false;
    });
    Workspace.simulationStopped.subscribe(res => {
      this.simulationStatus = res;
    });
    this.readPins();
    Workspace.circuitLoadStatus.subscribe(res => {
      this.readPins();
    });
    document.addEventListener('changed', (r) => {
      console.log('Detecting changes', r['detail']['ele']['element']);
      const changeInfo = r['detail']['ele'];
      if (changeInfo.keyName === 'wires') {
        const wire = changeInfo['element'];
        const SarduinoId = wire['start']['keyName'] === 'ArduinoUno' ? wire.start.id : undefined;
        const EarduinoId = wire['end']['keyName'] === 'ArduinoUno' ? wire.end.id : undefined;
        if (changeInfo.event === 'delete') {
          this.nodes = this.nodes.filter(i => {
            if (SarduinoId && i['arduinoId'] === SarduinoId) {
              if (i['point'] === wire.start.pid) {
                return false;
              }
            }
            if (EarduinoId && i['arduinoId'] === EarduinoId) {
              if (i['point'] === wire.end.pid) {
                return false;
              }
            }
            return true;
          });
          console.log(this.nodes);
        } else if (changeInfo.event === 'add') {
          const Sarduino = SarduinoId ? window['scope'].ArduinoUno.filter(arduino => arduino.id === wire.start.id)[0] : undefined;
          const Earduino = EarduinoId ? window['scope'].ArduinoUno.filter(arduino => arduino.id === wire.end.id)[0] : undefined;
          this.pushPoint(Sarduino, wire.start.pid);
          this.pushPoint(Earduino, wire.end.pid);
        }
      }
    });
    GraphDataService.voltageChange.subscribe(res => {
      if (res.value === 0) {
        this.initData = true;
      }
      if (this.arduinoList[0]['arduinoId'] === res.arduino.id && this.hexData[this.hexData.length - 1] !== res.value) {
        if (this.initData === true) {
          this.hexData.push(res.value);
          this.dataPoints++;
        }
      }
    });
  }

  pushPoint(arduino, pointId) {
    if (arduino) {
      const point = arduino['nodes'][pointId];
      if (point.connectedTo && (point.id <= 13 && point.id >= 2)) {
        this.nodes.push({point: point.id, arduinoId: arduino.id, arduinoName: arduino.name});
      }
    }
  }

  SaveData() {
    const pins = [];
    const newData = {};
    this.graphList.forEach(pinGraph => {
      pins.push(pinGraph.pinLabel);
    });
    this.arduinoList.forEach(ard => {
      newData[ard['arduinoId']] = {
        pinConnected: pins,
        hexVals: this.hexData,
        length: this.dataPoints
      };
    });
    const token = Login.getToken();
    if (!this.lti) {
      this.api.storeSimulationData(this.id, token, newData).subscribe(res => AlertService.showAlert('Record Saved Successfully')
      , err => AlertService.showAlert(err));
    } else {
      let ltiID;
      this.aroute.queryParams.subscribe(v => {
        ltiID = v.lti_id;
      });
      this.api.storeLTISimulationData(this.id, ltiID, token, newData).subscribe(res => {
        AlertService.showAlert('Record Saved Successfully');
        this.simDataSave.emit(true);
      }
      , err => {
        AlertService.showAlert(err);
        this.simDataSave.emit(false);
      });
    }
  }

}
