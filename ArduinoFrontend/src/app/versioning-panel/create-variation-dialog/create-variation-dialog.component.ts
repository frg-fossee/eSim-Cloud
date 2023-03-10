import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-create-variation-dialog',
  templateUrl: './create-variation-dialog.component.html',
  styleUrls: ['./create-variation-dialog.component.css']
})
export class CreateVariationDialogComponent implements OnInit {

  /**
   * FormControl for variation name
   */
  variationName = new FormControl('', [Validators.required, Validators.maxLength(20), Validators.minLength(1)]);

  /**
   * CreateVariation Dialog Component Constructor
   * @param dialogRef CreateVariationDialog's Reference
   */
  constructor(
    private dialogRef: MatDialogRef<CreateVariationDialogComponent>
  ) { }

  /**
   * On Init Callback
   */
  ngOnInit() {
  }

  /**
   * Close dialog with variationName as observable
   */
  createVariation() {
    this.dialogRef.close(this.variationName.value);
  }

}
