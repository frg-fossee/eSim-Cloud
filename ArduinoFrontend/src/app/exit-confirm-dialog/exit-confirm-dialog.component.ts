import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-exit-confirm-dialog',
  templateUrl: './exit-confirm-dialog.component.html',
  styleUrls: ['./exit-confirm-dialog.component.css']
})
export class ExitConfirmDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ExitConfirmDialogComponent>) { }

  ngOnInit() {
  }

  // Function to handle if user want to exit
  yesClick() {
    this.dialogRef.close(true);
  }

}
