import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormsService {

  constructor() { }

  form: FormGroup = new FormGroup({
    modelSchematic: new FormControl(''),
    consumerKey: new FormControl("", [Validators.required, Validators.minLength(2)]),
    secretKey: new FormControl("", [Validators.required, Validators.minLength(2)]),
    score: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(1)]),
    testCase: new FormControl(''),
    initialSchematic: new FormControl('', Validators.required),
    acceptSubmissions: new FormControl(true)
  })

  initialize() {
    this.form.setValue({
      modelSchematic: '',
      consumerKey: "",
      secretKey: "",
      score: 0,
      testCase: '',
      initialSchematic: '',
      acceptSubmissions: true
    });
  }

  getLTIDetails(data) {
    data = {
      secretKey: '',
      consumerKey: '',
      configURL: '',
      configExists: false,
      consumerError: '',
      score: data.score,
      initialSchematic: data.initialSchematic,
      modelSchematic: data.modelSchematic,
      testCase: ''
    }
    console.log(data);
  }
}
