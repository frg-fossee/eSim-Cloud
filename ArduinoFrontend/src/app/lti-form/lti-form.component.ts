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
export interface Circuit {
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
  view_code: boolean;
  con_weightage: number;
  code_weightage: number;
}

/**
 * Class for LTI Form
 */
@Component({
  selector: 'app-lti-form',
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
  hide = true;
  /**
   * stores relevant data of model circuit chosen
   */
  modelCircuit: Circuit;
  /**
   * stores relevant data of student/initial circuit chosen
   */
  studentCircuit: Circuit;
  /**
   * circuit id of the circuit received from query parameters
   */
  circuitId: string = null;
  /**
   * branch of the circuit received from query parameters
   */
  branch = '';
  /**
   * version of the circuit received from query parameters
   */
  version = '';
  /**
   * LTI ID of the circuit received from query parameters
   */
  lti: string = null;
  /**
   * Show/Hide Tooltip
   */
  copyTooltip = false;
  /**
   * Stores all versions of the circuit
   */
  circuits: any[];
  /**
   * Stores all test cases applicable for the circuit
   */
  testCases: any[] = [];
  /**
   * Stores config url shown in text box
   */
  configUrl = '';
  /**
   * Status of view code checkbox
   */
  viewCodeCheckBox = false;
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
    view_code: false,
    con_weightage: 60,
    code_weightage: 40
  };

  /**
   * Defines LTI Form Controls and Validators
   */
  form: FormGroup = new FormGroup({
    consumer_key: new FormControl('', [Validators.required, Validators.minLength(2)]),
    secret_key: new FormControl('', [Validators.required, Validators.minLength(2)]),
    score: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(1)]),
    con_weightage: new FormControl(60, [Validators.required, Validators.min(0), Validators.max(100)]),
    code_weightage: new FormControl(40),
    test_case: new FormControl(''),
    initial_schematic: new FormControl(0, Validators.required),
    model_schematic: new FormControl(0, Validators.required),
    scored: new FormControl(true),
    viewCode: new FormControl(false)
  });

  /**
   * On Init Callback
   */
  ngOnInit() {
    document.documentElement.style.overflow = 'auto';
    document.title = 'LTI | Arduino on Cloud';
    this.aroute.queryParams.subscribe(v => {
      // if project id is present and no query parameter then redirect to dashboard
      const token = Login.getToken();
      if (Object.keys(v).length === 0 && this.circuitId || !token) {
        setTimeout(() => this.router.navigate(['dashboard'])
          , 100);
        return;
      }
      this.circuitId = v.id;
      this.branch = v.branch;
      this.version = v.version;
      this.lti = v.lti;
      this.onClear();
      if (this.lti) {
        this.details.id = this.lti;
        // Get details of the LTI App.
        this.api.ArduinoexistLTIURL(this.circuitId, token).subscribe(res => {
          // Switch to the branch and version of the existing LTI App
          if (res['model_schematic'].branch !== this.branch || res['model_schematic'].version !== this.version) {
            this.router.navigate(
              [],
              {
                relativeTo: this.aroute,
                queryParams: {
                  id: this.circuitId,
                  branch: res['model_schematic'].branch,
                  version: res['model_schematic'].version,
                  lti: this.lti,
                },
              });
          }
          this.modelCircuit = res['model_schematic'];
          this.studentCircuit = res['initial_schematic'];
          res['initial_schematic'] = this.studentCircuit.id;
          res['model_schematic'] = this.modelCircuit.id;
          if (!environment.production) {
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
            view_code: res['view_code']
          };
          this.getAllVersions();
          this.getTestCases();
          this.configUrl = this.details.config_url;
        }, err => {
          if (err.status === 404) {
            this.details.configExists = false;
          }
          console.log(err);
          this.getAllVersions();
        });
      } else {
        this.details.configExists = false;
        this.getAllVersions();
        this.getTestCases();
        this.form.get('con_weightage').setValue(this.details.con_weightage);
        this.form.get('code_weightage').setValue(this.details.code_weightage);
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
      score: parseFloat(res['score']),
      // score: res['score'] ? 1 : 0,
      initial_schematic: parseInt(res['initial_schematic'], 10),
      model_schematic: parseInt(res['model_schematic'], 10),
      test_case: res['test_case'],
      scored: res['scored'],
      con_weightage: res['con_weightage'],
      code_weightage: 100 - res['con_weightage'],
      viewCode: res['view_code']
    });
  }

  gettestCaseSelectChange(value) {
    this.details.test_case = value;
  }

  /**
   * Called on changing option in select form field for test case
   * @param event Event data on changing select form field for test case
   */
  ontestCaseSelectChanges(event) {
    this.gettestCaseSelectChange(event.value);
  }

  getModelCircuitChange(value) {
    this.modelCircuit = value ? this.circuits.filter(v => v.id === parseInt(value, 10))[0] : undefined;
    this.getTestCases();
  }

  onModelCircuitChange(event) {
    this.getModelCircuitChange(event.value);
  }

  /**
   * Sets the student circuit of the LTI form
   * @param value id of the circuit to be set as initial/student circuit
   * @param callback function called after retrieving the intended circuit
   */
  getStudentSimulation(value) {
    this.studentCircuit = value ? this.circuits.filter(v => v.id === parseInt(value, 10))[0] : undefined;
  }

  /**
   * Called on changing option in select form field for student simulation
   * @param event Event data on changing select form field for student simulation
   */
  onStudentSelectChanges(event) {
    this.getStudentSimulation(event.value);
  }


  conCodeWeight(event) {
    this.details.code_weightage = 100 - this.form.value.con_weightage;
    this.form.get('code_weightage').setValue(100 - this.form.value.con_weightage);
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
        scored: this.form.value.scored ? true : false,
        view_code: this.form.value.viewCode ? true : false,
        model_schematic: this.modelCircuit.id,
        test_case: this.form.value.test_case ? this.form.value.test_case : null,
        score: this.form.value.score,
        con_weightage: this.form.value.con_weightage,
        configExists: false,
      };
      const token = Login.getToken();
      if (token) {
        const data = { ...this.details };
        delete data['configExists'];
        delete data['config_url'];
        delete data['consumerError'];
        delete data['id'];
        this.api.saveArduinoLTIDetails(token, data).subscribe(res => {
          this.setForm(res);
          this.details = {
            ...this.form.value,
            initial_schematic: res['initial_schematic'],
            id: res['id'],
            model_schematic: res['model_schematic'],
            config_url: res['config_url'],
            configExists: true,
            consumerError: '',
          };
          this.lti = res['id'];
          this.configUrl = this.details.config_url;
          this.router.navigate(
            [],
            {
              relativeTo: this.aroute,
              queryParams: {
                id: this.modelCircuit.save_id,
                branch: this.modelCircuit.branch,
                version: this.modelCircuit.version,
                lti: this.lti,
              },
            });
        }, err => {
          console.log(err);
          this.setConsumerError(err);
          this.details.configExists = false;
        });
      }
    }
  }

  /**
   * Called on clicking Delete button from LTI Form
   */
  onDelete() {
    const token = Login.getToken();
    if (token) {
      this.api.removeArduinoLTIDetails(this.details.model_schematic, token).subscribe(res => {
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
          view_code: false,
          con_weightage: 60,
          code_weightage: 40,
        };
        this.studentCircuit = undefined;
        this.circuits = [];
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
      });
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
      id: this.lti,
      configExists: this.details.configExists,
      model_schematic: this.modelCircuit.id,
      test_case: this.details.test_case,
      score: this.form.value.score,
      sim_params: [],
      view_code: this.form.value.viewCode ? true : false,
      con_weightage: this.details.con_weightage
    };
    if (!this.details.scored) {
      this.details.score = null;
    }
    const data = { ...this.details };
    delete data['configExists'];
    delete data['config_url'];
    delete data['consumerError'];
    this.api.updateArduinoLTIDetails(token, data).subscribe(res => {
      this.setForm(res);
      this.details = {
        ...this.details,
        ...this.form.value,
        id: res['id'] ? res['id'] : this.lti,
        model_schematic: parseInt(res['model_schematic'], 10),
        config_url: res['config_url'] ? res['config_url'] : this.details.config_url,
        configExists: true,
        consumerError: '',
      };
      AlertService.showAlert('Details Updated Succesfully');
      this.lti = res['id'];
      this.configUrl = this.details.config_url;
      this.router.navigate(
        [],
        {
          relativeTo: this.aroute,
          queryParams: {
            id: this.modelCircuit.save_id,
            branch: this.modelCircuit.branch,
            version: this.modelCircuit.version,
            lti: this.lti,
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
    this.details.consumerError = '';
    if (err.error) {
      Object.keys(err.error).forEach(key => {
        this.details.consumerError += `${key}:  `;
        if (err.error) {
          for (const e of err.error[key]) {
            this.details.consumerError += e + '\n';
          }
        }
      });
    } else {
      this.details.consumerError = err.message;
    }
  }

  /**
   * Copies URL from the text box
   */
  copyURL() {
    const copyUrl: HTMLTextAreaElement = document.querySelector('#lti-url');
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
      this.api.listAllVersions(this.circuitId, token).subscribe((v) => {
        this.circuits = v;
        if (this.modelCircuit) {
          this.modelCircuit = this.circuits.filter(c => c.id === this.modelCircuit.id)[0];
        } else {
          this.modelCircuit = this.circuits.filter(c => c.branch === this.branch && c.version === this.version)[0];
        }
        // Splice the model circuit from the retrieved ones if required.
      });
    } else {
      // if no token is present then show this message
      AlertService.showAlert('Please Login to Continue');
    }
  }

  getTestCases() {
    // get Auth token
    const token = Login.getToken();
    const temp = [];
    if (token) {
      if (this.modelCircuit) {
        this.api.getSimulationData(this.modelCircuit.save_id, this.modelCircuit.version, this.modelCircuit.branch, token).subscribe((v) => {
          for (const val of v) {
            const data = JSON.parse(val.result.replaceAll('\'', '\"'));
            const key = (Object.keys(data));
            temp.push({id: val.id, length: data[key[0]]['length']});
          }
          this.testCases = temp;
        }, err => {
          this.testCases = null;
        });
      } else {
        this.api.getSimulationData(this.circuitId, this.version, this.branch, token).subscribe((v) => {
          for (const val of v) {
            const data = JSON.parse(val.result.replaceAll('\'', '\"'));
            const key = (Object.keys(data));
            temp.push({id: val.id, length: data[key[0]]['length']});
          }
          this.testCases = temp;
        }, err => {
          this.testCases = null;
        });
      }
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
    let str = `${dateObj.getDate()}/${dateObj.getMonth()}/${dateObj.getFullYear()} `;
    str += `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;
    return str;
  }
}
