import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormsService {

  constructor() { }

  form: FormGroup = new FormGroup({
    model_schematic: new FormControl(''),
    consumer_key: new FormControl("", [Validators.required, Validators.minLength(2)]),
    secret_key: new FormControl("", [Validators.required, Validators.minLength(2)]),
    score: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(1)]),
    test_case: new FormControl(''),
    initial_schematic: new FormControl('', Validators.required),
    scored: new FormControl(true)
  })

  initialize() {
    this.form.setValue({
      model_schematic: '',
      consumer_key: "",
      secret_key: "",
      score: 0,
      test_case: '',
      initial_schematic: '',
      scored: true
    });
  }
}
