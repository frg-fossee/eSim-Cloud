import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { AlertService } from '../alert/alert-service/alert.service';
import { Login } from '../Libs/Login';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { listenToElementOutputs } from '@angular/core/src/view/element';

export interface circuit {
  id: number;
  branch: string;
  version: string;
  lti: string;
  image: string;
  description: string;
  save_id: string;
}
export interface LTIDetails {
  secret_key: string;
  consumer_key: string;
  config_url: string;
  configExists: boolean;
  consumerError: string;
  score: number;
  initial_schematic: number;
  model_schematic: number;
  test_case: string;
  scored: boolean;
  id: string;
}

@Component({
  selector: 'lti-form',
  templateUrl: './lti-form.component.html',
  styleUrls: ['./lti-form.component.css']
})
export class LTIFormComponent implements OnInit {

  constructor(
    public api: ApiService,
    private router: Router,
    private aroute: ActivatedRoute,
  ) {
  }

  hide: boolean = true;
  modelCircuit: circuit;
  studentCircuit: circuit;
  circuit_id: any = null; // strongly type it to string
  branch: string = '';
  version: string = '';
  lti_id: any = null; // strongly type it to string
  circuits: any[];
  testCases: any[];
  configUrl: string = '';
  details: LTIDetails = {
    secret_key: '',
    consumer_key: '',
    config_url: '',
    configExists: false,
    consumerError: '',
    score: 0,
    initial_schematic: 0,
    model_schematic: 0,
    test_case: null,
    scored: false,
    id: '',
  }
  form: FormGroup = new FormGroup({
    consumer_key: new FormControl("", [Validators.required, Validators.minLength(2)]),
    secret_key: new FormControl("", [Validators.required, Validators.minLength(2)]),
    score: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(1)]),
    test_case: new FormControl(''),
    initial_schematic: new FormControl(0, Validators.required),
    scored: new FormControl(true)
  })

  ngOnInit() {
    this.aroute.queryParams.subscribe(v => {
      console.log(v);
      // if project id is present and no query parameter then redirect to dashboard
      const token = Login.getToken();
      if (Object.keys(v).length === 0 && this.circuit_id || !token) {
        setTimeout(() => this.router.navigate(['dashboard'])
          , 100);
        return;
      }
      this.circuit_id = v.id;
      this.branch = v.branch;
      this.version = v.version;
      this.lti_id = v.lti;
      this.onClear();
      if(this.lti_id) {
        this.details.id = this.lti_id;
        this.api.existLTIURL(this.circuit_id, token).subscribe(res => {
          this.modelCircuit = res['model_schematic'];
          this.studentCircuit = res['initial_schematic'];
          res['initial_schematic'] = `${this.studentCircuit.id}`;
          res['model_schematic'] = this.modelCircuit.id;
          this.setForm(res);
          this.details = {
            ...this.form.value,
            model_schematic: res['model_schematic'],
            config_url: res['config_url'],
            consumerError: '',
            configExists: true,
          };
          this.getAllVersions();
          this.configUrl = this.details.config_url;
          console.log(res);
        }, err => {
          if (err.status == 404) {
            this.details.configExists = false;
          }
          console.log(err);
          this.getAllVersions();
        });
      } else {
        this.details.configExists = false;
        this.getAllVersions();
      }
    });
  }

  setForm(res: any) {
    this.form.setValue({
      consumer_key: res['consumer_key'],
      secret_key: res['secret_key'],
      score: res['score'],
      initial_schematic: res['initial_schematic'],
      test_case: res['test_case'],
      scored: res['scored'],
    })
  }

  ontestCaseSelectChanges(event) {
    console.log(event);
  }

  getStudentSimulation(value, callback) {
    this.studentCircuit = value ? this.circuits.filter(v => v.id === parseInt(value, 10))[0] : undefined;
    callback();
  }

  onStudentSimulationSelectChanges(event) {
    this.getStudentSimulation(event.value, () => console.log(this.studentCircuit));
  }

  onSubmit() {
    if (this.form.valid) {
      if (!this.details.scored) {
        this.details.score = null;
      }
      this.details = {
        ...this.details,
        ...this.form.value,
        model_schematic: this.modelCircuit.id,
        test_case: null,
        scored: false,
      }
      const token = Login.getToken();
      if (token) {
        let data = this.details;
        delete data['configExists']
        delete data['config_url']
        delete data['consumerError']
        delete data['id']
        console.log(data);
        this.api.saveLTIDetails(token, data).subscribe(res => {
          console.log(res);
          this.setForm(res);
          this.details = {
            ...this.form.value,
            initial_schematic: `${res['initial_schematic']}`,
            id: res['id'],
            model_schematic: res['model_schematic'],
            config_url: res['config_url'],
            configExists: true,
            consumerError: '',
          }
          this.lti_id = res['id'];
          // this.studentCircuit = res['initial_schematic'];
          // this.modelCircuit = res['model_schematic'];
          this.configUrl = this.details.config_url;
          console.log(res);
          console.log(this.configUrl);
          this.router.navigate(
            [],
            {
              relativeTo: this.aroute,
              queryParams: {
                id: this.modelCircuit.save_id,
                branch: this.modelCircuit.branch,
                version: this.modelCircuit.version,
                lti: this.lti_id,
              },
              queryParamsHandling: 'merge'
            });
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
      this.api.removeLTIDetails(this.details.model_schematic, token).subscribe(res => {
        console.log(res);
        this.details = {
          ...this.details,
          secret_key: '',
          consumer_key: '',
          config_url: '',
          configExists: false,
          consumerError: '',
          score: 0,
          test_case: null,
          scored: false,
          id: '',
        }
        this.studentCircuit = undefined;
        this.configUrl = this.details.config_url;
        this.router.navigate(
          [],
          {
            relativeTo: this.aroute,
            queryParams: {
              id: this.modelCircuit.save_id,
              branch: this.modelCircuit.branch,
              version: this.modelCircuit.version,
            },
            queryParamsHandling: 'merge'
          });
      }, err => {
        console.log(err);
        this.setConsumerError(err);
        this.details.configExists = true;
      })
    }
  }

  onUpdate() {
    const token = Login.getToken();
    if (!this.form.valid && !token) {
      return;
    }
    this.details = {
      ...this.details,
      ...this.form.value,
      configExists: this.details.configExists, // false,
      model_schematic: this.details.model_schematic,
      test_case: null,
    }
    if (!this.details.scored) {
      this.details.score = null;
    }
    let data = this.details;
    delete data['configExists']
    delete data['config_url']
    delete data['consumerError']
    console.log(data);
    this.api.updateLTIDetails(token, data).subscribe(res => {
      console.log(res);
      this.setForm(res);
      this.details = {
        ...this.details,
        ...this.form.value,
        initial_schematic: `${res['initial_schematic']}`,
        id: res['id'] ? res['id']: this.lti_id,
        model_schematic: res['model_schematic'],
        config_url: res['config_url'],
        configExists: true,
        consumerError: '',
      }
      // this.lti_id = res['id'];
      this.configUrl = this.details.config_url;
      console.log(res);
      console.log(this.configUrl);
    }, err => {
      console.log(err);
      this.setConsumerError(err);
      // this.details.configExists = false;
    });
  }

  onClear() {
    this.form.reset();
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

  copyURL() {
    let copyUrl:HTMLTextAreaElement = document.querySelector('#lti-url');
    copyUrl.select();
    copyUrl.setSelectionRange(0, 99999);
    document.execCommand('copy');
  }

  /**
   * Get all variation of project
   */
   getAllVersions() {
    // get Auth token
    const token = Login.getToken();
    if(token) {
      this.api.listAllVersions(this.circuit_id, token).subscribe((v) => {
        this.circuits = v;
        if(this.modelCircuit) {
          this.circuits.filter(v => v.id === this.modelCircuit.id)[0]
        } else {
          this.modelCircuit = this.circuits.filter(v => v.branch === this.branch && v.version === this.version)[0]
        }
        this.circuits.forEach(v => {
          const dateObj = new Date(v.save_time);
          v.save_time = `${dateObj.getDate()}/${dateObj.getMonth()}/${dateObj.getFullYear()} ${dateObj.getHours()}:${dateObj.getMinutes()}`;
        });
        // Splice the model circuit from the retrieved ones.
      });
    } else {
      // if no token is present then show this message
      AlertService.showAlert('Please Login to Continue');
    }
  }
}