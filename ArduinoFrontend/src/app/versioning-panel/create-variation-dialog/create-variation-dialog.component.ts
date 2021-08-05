import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-create-variation-dialog',
  templateUrl: './create-variation-dialog.component.html',
  styleUrls: ['./create-variation-dialog.component.css']
})
export class CreateVariationDialogComponent implements OnInit {

  variationName = new FormControl('');

  constructor(private dialogRef: MatDialogRef<CreateVariationDialogComponent>) { }

  ngOnInit() {
  }

  createVariation() {
    console.log(this.variationName.value);
    this.dialogRef.close(this.variationName.value);
  }

}
