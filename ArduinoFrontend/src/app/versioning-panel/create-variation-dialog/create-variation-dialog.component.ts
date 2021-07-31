import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-create-variation-dialog',
  templateUrl: './create-variation-dialog.component.html',
  styleUrls: ['./create-variation-dialog.component.css']
})
export class CreateVariationDialogComponent implements OnInit {

  var_name = new FormControl();

  constructor() { }

  ngOnInit() {
  }

  createVariation() {
    console.log(this.var_name.value);
  }

}
