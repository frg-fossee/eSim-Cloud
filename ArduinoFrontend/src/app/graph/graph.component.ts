import { Component, EventEmitter, Input, OnInit, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js';
import { GraphDataService } from '../graph-data.service';
import { Point } from '../Libs/Point';
import { Workspace } from '../Libs/Workspace';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {

  data: number[];
  xlabels: string[];
  pinGraph: Chart;
  chartConfig: any;
  previousTime: Date;
  @Input() id: string;
  @Input() arduino: number;
  state: boolean;
  nodes: string[];
  ignored: boolean = false;
  pinId = "";

  constructor(private graphDataService: GraphDataService) {
    this.data = [];
    this.xlabels = [];
    this.chartConfig = {};
    this.previousTime = new Date();
    this.nodes = [];
  }

  ngOnInit() {
    Workspace.simulationStopped.subscribe(res => {
      this.ignored = false;
    });
    Workspace.simulationStarted.subscribe(res => {
      this.clearGraph();
    });
  }

  ngAfterViewInit() {
    const canvasElement = `graph${this.id}`;
    this.configChart();
    this.pinGraph = new Chart(document.getElementById(canvasElement) as HTMLCanvasElement, this.chartConfig);
    GraphDataService.voltageChange.subscribe(res => {
      if (res.pinTo <= Number(this.id) && Number(this.id) <= res.pinFrom && this.arduino === res.arduino.id) {
        let pinNumber = 15 - parseInt(this.id, 10);
        let pinBitInPort = pinNumber > 7 ? pinNumber - 8: pinNumber;
        console.log(this.id, pinBitInPort, res.value);
        this.pinGraph.data.datasets[0].label = res.label;
        this.pinId = `${res.arduino.name} - D${pinNumber}`;
        this.data.push((res.value >> pinBitInPort) & 1);
        this.xlabels.push(res.time);
        console.log(this.data, this.pinId);
        this.pinGraph.update();
      }
      // else {
      //   this.data.push(this.data[this.data.length - 1] ? this.data[this.data.length - 1] : 0);
      //   this.xlabels.push(res.time.getMilliseconds());
      // }
    });
  }

  clearGraph() {
    this.data.splice(0, this.data.length);
    this.xlabels.splice(0, this.xlabels.length);
    this.pinGraph.update();
    // console.log(this.nodes);
  }

  configChart() {
    this.chartConfig = {
      animationEnabled: true,
      type: 'line',
      data: {
        labels: this.xlabels,
        datasets: [{
          label: 'PIN',
          fill: false,
          backgroundColor: 'rgb(0, 0, 0)',
          borderColor: 'rgb(0, 0, 0)',
          data: this.data,
          steppedLine: true,
        }],
      },
      options: {
        legend: {
          display: false
        },
        responsive: true,
        scales: {
          xAxes: [{
            scaleLabel: {
              display: false,
              labelString: 'Time'
            }, gridLines: {
              display: false
            },
            ticks: {
              display: false,
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: false,
              labelString: 'States',
            },
            gridLines: {
              display: false
            },
            ticks: {
              beginAtZero: true,
              min: 0,
              stepSize: 1,
              max: 2,
              callback: function(value, index) {
                return value > 1 ? '': value;
              },
            }
          }],
        },
      },
    }
  }
}