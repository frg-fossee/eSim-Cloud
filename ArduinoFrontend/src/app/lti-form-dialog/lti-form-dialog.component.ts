import { Component, Inject, OnInit } from '@angular/core';
import { FormsService } from '../forms.service';
import { ApiService } from '../api.service';
import { AlertService } from '../alert/alert-service/alert.service';
import { Login } from '../Libs/Login';
import { SaveOffline } from '../Libs/SaveOffiline';
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
  acceptSubmissions: boolean;
}

@Component({
  selector: 'lti-form-dialog',
  templateUrl: './lti-form-dialog.component.html',
  styleUrls: ['./lti-form-dialog.component.css']
})
export class LTIFormDialogComponent implements OnInit {

  constructor(
    public service: FormsService,
    public api: ApiService,
    private router: Router,
    private aroute: ActivatedRoute,
  ) {
  }

  modelCircuit: any;
  studentCircuit: any;
  circuit_id: any = ''; // strongly type it to string
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
    initial_schematic: this.circuit_id,
    model_schematic: this.circuit_id,
    test_case: null,
    scored: false,
    acceptSubmissions: false,
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
        this.service.form.setValue({
          consumer_key: res['consumer_key'],
          secret_key: res['secret_key'],
          score: res['score'],
          initial_schematic: res['initial_schematic'],
          model_schematic: res['model_schematic'],
          test_case: res['test_case'],
          acceptSubmissions: false,
        })
        this.details = {
          ...this.service.form.value,
          scored: res['scored'],
          config_url: res['config_url'],
          consumerError: '',
          configExists: true,
        };
        this.configUrl = this.details.config_url;
        }, err => {
        console.log(err);
      })
    this.readOnCloudItems();
    });
  }

  ontestCaseSelectChanges(event) {
    console.log(event);
  }

  onStudentSimulationSelectChanges(event) {
    this.studentCircuit = event.value ? this.circuits.filter(v => v.save_id === event.value)[0] : this.modelCircuit;
    console.log(this.studentCircuit);
  }

  onSubmit() {
    if(this.service.form.valid) {
      if (this.details.scored) {
        this.details.score = null;
      }
      this.details = {
        ...this.service.form.value,
        model_schematic: this.circuit_id,
        test_case: null,
        configExists: false,
        scored: false,
      }
      const token = Login.getToken();
      if(token) {
        let data = this.details;
        delete data['configExists']
        delete data['config_url']
        delete data['consumerError']
        delete data['acceptSubmissions']
        console.log(data);
        this.api.saveLTIDetails(this.circuit_id, token, data).subscribe(res => {
            this.details = {
              ...this.details,
              config_url: res['config_url'],
              configExists: true,
              consumerError: '',
              score: res['score'],
              scored: res['scored']
            }
            this.configUrl = this.details.config_url;
            console.log(this.configUrl);
          }, err => {
          console.log(err);
          this.details = {
            ...this.details,
            configExists: false,
            consumerError: 'An error was encountered while setting the details!',
          }
        })
        // this.service.getLTIDetails(this.service.form.value);
      }
      this.onClear();
    }
  }

  copyText(element) {
  }

  onDelete() {
    const token = Login.getToken();
    if(token) {
      this.api.removeLTIDetails(this.circuit_id, token).subscribe(res => {
        this.details = {
          secret_key: '',
          consumer_key: '',
          config_url: '',
          configExists: false,
          consumerError: '',
          score: 0,
          initial_schematic: this.circuit_id,
          model_schematic: this.circuit_id,
          test_case: null,
          scored: false,
          acceptSubmissions: false,
        }
      }, err => {
        console.log(err);
      })
    }
  }

  onClear() {
    this.service.form.reset();
    this.service.initialize();
  }

  readOnCloudItems() {
    // Get Login token
    const token = Login.getToken();
    // if token is present get the list of project created by a user
    if (token) {
      this.api.listProject(token).subscribe((val: any[]) => {
        this.circuits = val;
        this.modelCircuit = val.filter(v => v.save_id === this.circuit_id)[0];
        this.studentCircuit = this.modelCircuit;
      }, err => console.log(err));
    } else {
      // if no token is present then show this message
      AlertService.showAlert('Please Login to See Circuit');
    }
  }

  readTempItems() {
    // Read All Offline Project
    SaveOffline.ReadALL((v: any[]) => {
      // Map Offline Project to circuits array
      this.circuits = v.map(item => {
        if(item.id === this.circuit_id) {
          this.modelCircuit = {
            name: item.project.name,
            description: item.project.description,
            create_time: item.project.created_at,
            save_time: item.project.updated_at,
            base64_image: item.project.image,
            save_id: item.id,
          }
          this.studentCircuit = this.modelCircuit;
        }
        return {
          id: item.id,
          name: item.project.name,
          description: item.project.description,
          create_time: item.project.created_at,
          save_time: item.project.updated_at,
          base64_image: item.project.image,
          save_id: item.id,
        };
      });
    });
  }
}