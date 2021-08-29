import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { AlertService } from '../alert/alert-service/alert.service';
import { Login } from '../Libs/Login';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

/**
 * Interface to store relevant circuit data
 */
export interface circuit {
  id: number;
  branch: string;
  version: string;
  lti: string;
  image: string;
  description: string;
  save_id: string;
}

/**
 * Interface to store LTI Details
 */
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
  sim_params: string[];
}

/**
 * Class for LTI Form
 */
@Component({
  selector: 'lti-form',
  templateUrl: './lti-form.component.html',
  styleUrls: ['./lti-form.component.css']
})
export class LTIFormComponent implements OnInit {

  /**
   * LTI Form Component Constructor
   * @param api API service for api calls
   * @param router Router to navigate
   * @param aroute Activated Route
   */
  constructor(
    public api: ApiService,
    private router: Router,
    private aroute: ActivatedRoute,
  ) {
  }

  /**
   * Toggles input type of secret key form-field
   */
  hide: boolean = true;
  /**
   * stores relevant data of model circuit chosen
   */
  modelCircuit: circuit;
  /**
   * stores relevant data of student/initial circuit chosen
   */
  studentCircuit: circuit;
  /**
   * circuit id of the circuit received from query parameters
   */
  circuit_id: string = null;
  /**
   * branch of the circuit received from query parameters
   */
  branch: string = '';
  /**
   * version of the circuit received from query parameters
   */
  version: string = '';
  /**
   * LTI ID of the circuit received from query parameters
   */
  lti_id: string = null;
  /**
   * Show/Hide Tooltip
   */
  copyTooltip: boolean = false;
  /**
   * Stores all versions of the circuit
   */
  circuits: any[];
  /**
   * Stores all test cases applicable for the circuit
   */
  testCases: any[];
  /**
   * Stores config url shown in text box
   */
  configUrl: string = '';
  /**
   * Stores LTI details recieved from backend and the LTI Form
   */
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
    sim_params: [],
  }
  /**
   * Defines LTI Form Controls and Validators
   */
  form: FormGroup = new FormGroup({
    consumer_key: new FormControl("", [Validators.required, Validators.minLength(2)]),
    secret_key: new FormControl("", [Validators.required, Validators.minLength(2)]),
    score: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(1)]),
    test_case: new FormControl(''),
    initial_schematic: new FormControl(0, Validators.required),
    scored: new FormControl(true),
  })

  /**
   * On Init Callback
   */
  ngOnInit() {
    document.documentElement.style.overflow = 'auto';
    document.title= 'LTI | Arduino on Cloud';
    this.aroute.queryParams.subscribe(v => {
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
      if (this.lti_id) {
        this.details.id = this.lti_id;
        const token = Login.getToken();
        // Get details of the LTI App.
        this.api.existLTIURL(this.circuit_id, token).subscribe(res => {
          // Switch to the branch and version of the existing LTI App
          if (res['model_schematic'].branch != this.branch || res['model_schematic'].version != this.version) {
            this.router.navigate(
              [],
              {
                relativeTo: this.aroute,
                queryParams: {
                  id: this.circuit_id,
                  branch: res['model_schematic'].branch,
                  version: res['model_schematic'].version,
                  lti: this.lti_id,
                },
              });
          }
          this.modelCircuit = res['model_schematic'];
          this.studentCircuit = res['initial_schematic'];
          res['initial_schematic'] = this.studentCircuit.id;
          res['model_schematic'] = this.modelCircuit.id;
          if(!environment.production) {
            this.modelCircuit['base64_image'] = environment.API_URL + this.modelCircuit['base64_image'];
            this.studentCircuit['base64_image'] = environment.API_URL + this.studentCircuit['base64_image'];
          }
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

  /**
   * Sets the form fields as set in the supplied object
   * @param res Object with interface similar to form property
   */
  setForm(res: any) {
    this.form.setValue({
      consumer_key: res['consumer_key'],
      secret_key: res['secret_key'],
      score: parseInt(res['score'], 10),
      initial_schematic: parseInt(res['initial_schematic'], 10),
      test_case: res['test_case'],
      scored: res['scored'],
    })
  }

  /**
   * Called on changing option in select form field for test case
   * @param event Event data on changing select form field for test case 
   */
  ontestCaseSelectChanges(event) {
    console.log(event);
  }

  /**
   * Sets the student circuit of the LTI form
   * @param value id of the circuit to be set as initial/student circuit
   * @param callback function called after retrieving the intended circuit
   */
  getStudentSimulation(value, callback) {
    this.studentCircuit = value ? this.circuits.filter(v => v.id === parseInt(value, 10))[0] : undefined;
    if (callback) {
      callback();
    }
  }

  /**
   * Called on changing option in select form field for student simulation
   * @param event Event data on changing select form field for student simulation 
   */
  onStudentSelectChanges(event) {
    this.getStudentSimulation(event.value, null);
  }

  /**
   * Called on clicking Save button from LTI Form
   */
  onSubmit() {
    if (this.form.valid) {
      if (!this.details.scored) {
        this.details.score = null;
      }
      this.details = {
        ...this.details,
        ...this.form.value,
        scored: this.form.value.scored ? this.form.value.scored : false,
        model_schematic: this.modelCircuit.id,
        test_case: null,
        sim_params: [],
        configExists: false,
      }
      const token = Login.getToken();
      if (token) {
        let data = { ...this.details };
        delete data['configExists']
        delete data['config_url']
        delete data['consumerError']
        delete data['id']
        this.api.saveLTIDetails(token, data).subscribe(res => {
          this.setForm(res);
          this.details = {
            ...this.form.value,
            initial_schematic: res['initial_schematic'],
            id: res['id'],
            model_schematic: res['model_schematic'],
            config_url: res['config_url'],
            configExists: true,
            consumerError: '',
          }
          this.lti_id = res['id'];
          this.configUrl = this.details.config_url;
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
            });
        }, err => {
          console.log(err);
          this.setConsumerError(err);
          this.details.configExists = false;
        })
      }
    }
  }

  /**
   * Called on clicking Delete button from LTI Form
   */
  onDelete() {
    const token = Login.getToken();
    if (token) {
      this.api.removeLTIDetails(this.details.model_schematic, token).subscribe(res => {
        this.details = {
          ...this.details,
          secret_key: '',
          consumer_key: '',
          config_url: '',
          configExists: false,
          consumerError: '',
          score: 0,
          test_case: null,
          sim_params: [],
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
          });
      }, err => {
        console.log(err);
        this.setConsumerError(err);
        this.details.configExists = true;
      })
    }
  }

  /**
   * Called on clicking Update button from LTI Form
   */
  onUpdate() {
    const token = Login.getToken();
    if (!this.form.valid && !token) {
      return;
    }
    this.details = {
      ...this.details,
      ...this.form.value,
      id: this.lti_id,
      configExists: this.details.configExists,
      model_schematic: this.details.model_schematic,
      test_case: null,
      sim_params: [],
    }
    if (!this.details.scored) {
      this.details.score = null;
    }
    let data = { ...this.details };
    delete data['configExists']
    delete data['config_url']
    delete data['consumerError']
    this.api.updateLTIDetails(token, data).subscribe(res => {
      this.setForm(res);
      this.details = {
        ...this.details,
        ...this.form.value,
        id: res['id'] ? res['id'] : this.lti_id,
        model_schematic: parseInt(res['model_schematic'], 10),
        config_url: res['config_url'] ? res['config_url'] : this.details.config_url,
        configExists: true,
        consumerError: '',
      }
      this.lti_id = res['id'];
      this.configUrl = this.details.config_url;
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
        });
    }, err => {
      console.log(err);
      this.setConsumerError(err);
    });
  }

  /**
   * Called to reset LTI Form
   */
  onClear() {
    this.form.reset();
  }

  /**
   * Set errors received from backend
   */
  setConsumerError(err) {
    this.details.consumerError = "";
    if (err.error) {
      Object.keys(err.error).forEach(key => {
        this.details.consumerError += `${key}:  `
        for (let i = 0; i < err.error[key].length; i++) {
          this.details.consumerError += err.error[key][i] + '\n';
        }
      });
    }
    else {
      this.details.consumerError = err.message;
    }
  }

  /**
   * Copies URL from the text box
   */
  copyURL() {
    let copyUrl: HTMLTextAreaElement = document.querySelector('#lti-url');
    this.copyTooltip = true;
    copyUrl.select();
    copyUrl.setSelectionRange(0, 99999);
    document.execCommand('copy');
  }

  /**
   * Get all variations of the circuit
   */
  getAllVersions() {
    // get Auth token
    const token = Login.getToken();
    if (token) {
      this.api.listAllVersions(this.circuit_id, token).subscribe((v) => {
        this.circuits = v;
        if (this.modelCircuit) {
          this.circuits.filter(v => v.id === this.modelCircuit.id)[0]
        } else {
          this.modelCircuit = this.circuits.filter(v => v.branch === this.branch && v.version === this.version)[0]
        }
        // Splice the model circuit from the retrieved ones if required.
      });
    } else {
      // if no token is present then show this message
      AlertService.showAlert('Please Login to Continue');
    }
  }

  /**
   * Comparing the circuits using their id field
   * @param id1 Id of circuit selected
   * @param id2 Id of the circuits from mat-option
   * @returns boolean value whether ids are same or not
   */
  compareIds(id1, id2) {
    return id1 && id2 && id1 === id2;
  }

  /**
   * Converts date string in appropriate format
   * @param date Date string returned by backend
   * @returns date string in human readable format
   */
  getFormattedDate(date: string) {
    const dateObj = new Date(date);
    return `${dateObj.getDate()}/${dateObj.getMonth()}/${dateObj.getFullYear()} ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;
  }
}