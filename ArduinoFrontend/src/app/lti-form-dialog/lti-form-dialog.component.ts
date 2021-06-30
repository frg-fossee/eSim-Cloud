import { Component, Inject, OnInit } from '@angular/core';
import { FormsService } from '../forms.service';
import { ApiService } from '../api.service';
import { AlertService } from '../alert/alert-service/alert.service';
import { Login } from '../Libs/Login';
import { SaveOffline } from '../Libs/SaveOffiline';
import { ActivatedRoute, Router } from '@angular/router';

export interface LTIDetails {
  secretKey: string;
  consumerKey: string;
  configURL: string;
  configExists: boolean;
  consumerError: string;
  score: number;
  initialSchematic: string;
  modelSchematic: string;
  testCase: string;
  scored: number;
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
  configUrl: string = null;
  details: LTIDetails = {
    secretKey: '',
    consumerKey: '',
    configURL: '',
    configExists: false,
    consumerError: '',
    score: 0,
    initialSchematic: this.circuit_id,
    modelSchematic: this.circuit_id,
    testCase: null,
    scored: 0,
  }

  ngOnInit() {
    this.aroute.queryParams.subscribe(v => {
      // if project id is present and no query parameter then redirect to dashoard
      // const token = Login.getToken();
      if (Object.keys(v).length === 0 && this.circuit_id) { // || !token) {
        setTimeout(() => this.router.navigate(['dashboard'])
          , 100);
        return;
      }
      this.circuit_id = v.id;
      // this.api.existLTIURL(this.circuit_id, token).subscribe(res => {
      //   this.details = {
      //     ...res['data'],
      //     configExists: true,
      //   };
      //   this.configUrl = this.details.configURL;
      //   if(this.details.configURL) {
      //     let data = this.details;
      //     delete data['configExists'];
      //     try {
      //       this.api.saveLTIDetails(this.circuit_id, data).subscribe(res => {
      //         this.details = {
      //           ...res['data'],
      //           configExists: true,
      //         };
      //       })
      //     } catch(err) {
      //       AlertService.showAlert(err);
      //     }
      //   }
      // })
      this.readTempItems();
    });
  }

  onTestCaseSelectChanges(event) {
    console.log(event);
  }

  onStudentSimulationSelectChanges(event) {
    if(event.value) {
      this.studentCircuit = this.circuits.filter(v => v.id == event.value)[0];
    }
    else {
      this.studentCircuit = this.modelCircuit;
    }
    console.log(this.studentCircuit);
  }

  onSubmit() {
    if(this.service.form.valid) {
      this.service.form.patchValue({
        modelSchematic: this.circuit_id,
        testCase: null,
      })
      this.service.getLTIDetails(this.service.form.value)
      this.onClear();
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
        this.modelCircuit = val.filter(v => v.id === this.circuit_id);
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
        if(item.id == this.circuit_id) {
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