import { Component, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import { FormsService } from '../forms.service';
import { ApiService } from '../api.service';
import { AlertService } from '../alert/alert-service/alert.service';
import { Login } from '../Libs/Login';
import { ActivatedRoute, Router } from '@angular/router';

export interface LTIDetails {
  secret_key: string;
  consumer_key: string;
  config_url: string;
  configExists: boolean;
  consumerError: string;
  score: number;
  initial_schematic: string;
  model_schematic: string;
  test_case: string;
  scored: boolean;
}

@Component({
  selector: 'lti-form',
  templateUrl: './lti-form.component.html',
  styleUrls: ['./lti-form.component.css']
})
export class LTIFormComponent implements OnInit {

  constructor(
    public service: FormsService,
    public api: ApiService,
    private router: Router,
    private aroute: ActivatedRoute,
  ) {
  }

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  hide: boolean = true;
  copyStatus: string;
  modelCircuit: any;
  studentCircuit: any;
  circuit_id: any = null; // strongly type it to string
  circuits: any[];
  offline: any[];
  testCases: any[];
  configUrl: string = '';
  details: LTIDetails = {
    secret_key: '',
    consumer_key: '',
    config_url: '',
    configExists: false,
    consumerError: '',
    score: 0,
    initial_schematic: null,
    model_schematic: this.circuit_id,
    test_case: null,
    scored: false,
  }

  ngOnInit() {
    this.aroute.queryParams.subscribe(v => {
      // if project id is present and no query parameter then redirect to dashboard
      const token = Login.getToken();
      if (Object.keys(v).length === 0 && this.circuit_id || !token) {
        setTimeout(() => this.router.navigate(['dashboard'])
          , 100);
        return;
      }
      this.circuit_id = v.id;
      this.onClear();
      this.api.existLTIURL(this.circuit_id, token).subscribe(res => {
        this.setForm(res);
        this.details = {
          ...this.service.form.value,
          config_url: res['config_url'],
          consumerError: '',
          configExists: true,
        };
        this.studentCircuit = res['initial_schematic']
        this.modelCircuit = res['model_schematic']
        this.configUrl = this.details.config_url;
        console.log(res);
        this.readOnCloudItems();
      }, err => {
        if (err.status == 404) {
          this.details = {
            ...this.details,
            configExists: false,
          }
        }
        console.log(err);
        this.readOnCloudItems();
      })
    });
  }

  setForm(res: any) {
    this.service.form.setValue({
      consumer_key: res['consumer_key'],
      secret_key: res['secret_key'],
      score: res['score'],
      initial_schematic: res['initial_schematic']['save_id'],
      model_schematic: res['model_schematic'] ? res['model_schematic']['save_id'] : this.circuit_id,
      test_case: res['test_case'],
      scored: res['scored'],
    })
  }

  ontestCaseSelectChanges(event) {
    console.log(event);
  }

  onStudentSimulationSelectChanges(event) {
    this.studentCircuit = event.value ? this.circuits.filter(v => v.save_id === event.value)[0] : undefined;
    console.log(this.studentCircuit);
  }

  onSubmit() {
    if (this.service.form.valid) {
      if (!this.details.scored) {
        this.details.score = null;
      }
      this.details = {
        ...this.service.form.value,
        model_schematic: this.circuit_id,
        test_case: null,
        scored: false,
      }
      const token = Login.getToken();
      if (token) {
        let data = this.details;
        delete data['configExists']
        delete data['config_url']
        delete data['consumerError']
        console.log(data);
        this.api.saveLTIDetails(this.circuit_id, token, data).subscribe(res => {
          this.setForm(res);
          this.details = {
            ...this.service.form.value,
            config_url: res['config_url'],
            configExists: true,
            consumerError: '',
          }
          this.studentCircuit = res['initial_schematic'];
          this.modelCircuit = res['model_schematic'];
          this.configUrl = this.details.config_url;
          console.log(res);
          console.log(this.configUrl);
        }, err => {
          console.log(err);
          this.setConsumerError(err);
          this.details.configExists = false;
        })
      }
    }
  }

  onDelete() {
    const token = Login.getToken();
    if (token) {
      this.api.removeLTIDetails(this.circuit_id, token).subscribe(res => {
        this.details = {
          secret_key: '',
          consumer_key: '',
          config_url: '',
          configExists: false,
          consumerError: '',
          score: 0,
          initial_schematic: null,
          model_schematic: this.circuit_id,
          test_case: null,
          scored: false,
        }
        this.studentCircuit = undefined;
        this.configUrl = this.details.config_url;
      }, err => {
        console.log(err);
        this.setConsumerError(err);
        this.details.configExists = true;
      })
    }
  }

  onUpdate() {
    const token = Login.getToken();
    if (!this.service.form.valid && !token) {
      return;
    }
    this.details = {
      ...this.service.form.value,
      configExists: this.details.configExists, // false,
      model_schematic: this.circuit_id,
      test_case: null,
    }
    if (!this.details.scored) {
      this.details.score = null;
    }
    let data = this.details;
    delete data['configExists']
    delete data['config_url']
    delete data['consumerError']
    this.api.updateLTIDetails(this.circuit_id, token, data).subscribe(res => {
      this.setForm(res);
      this.details = {
        ...this.service.form.value,
        config_url: res['config_url'],
        configExists: true,
        consumerError: '',
      }
      this.studentCircuit = res['initial_schematic'];
      this.modelCircuit = res['model_schematic'];
      this.configUrl = this.details.config_url;
      console.log(res);
      console.log(this.configUrl);
    }, err => {
      console.log(err);
      this.setConsumerError(err);
      this.details.configExists = false;
    });
  }

  onClear() {
    this.service.form.reset();
    this.service.initialize();
  }

  setConsumerError(err) {
    this.details.consumerError = "";
      if(err.error) {
        Object.keys(err.error).forEach(key => {
          for (let i = 0; i < err.error[key].length; i++) {
            this.details.consumerError += err.error[key][i] + '\n';
          }
        });
      }
      else {
        this.details.consumerError = err.message;
      }
  }

  readOnCloudItems() {
    // Get Login token
    const token = Login.getToken();
    // if token is present get the list of project created by a user
    if (token) {
      this.api.listProject(token).subscribe((val: any[]) => {
        this.circuits = val;
        this.modelCircuit = val.filter(v => v.save_id === this.circuit_id)[0];
        console.log(this.modelCircuit);
      }, err => console.log(err));
    } else {
      // if no token is present then show this message
      AlertService.showAlert('Please Login to See Circuit');
    }
  }


  CopyUrlToClipBoard() {
    const urlDisplayer = document.querySelector('#urlDisplayer');
  }
}