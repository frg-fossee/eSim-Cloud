import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-create-variation-dialog',
  templateUrl: './create-variation-dialog.component.html',
  styleUrls: ['./create-variation-dialog.component.css']
})
export class CreateVariationDialogComponent implements OnInit {

  var_name = new FormControl('');

  constructor(private _dialogRef: MatDialogRef<CreateVariationDialogComponent>) { }

  ngOnInit() {
  }

  createVariation() {
    console.log(this.var_name.value);
    this._dialogRef.close(this.var_name.value);
  }

}
