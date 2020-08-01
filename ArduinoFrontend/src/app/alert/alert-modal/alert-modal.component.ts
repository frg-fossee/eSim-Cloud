import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

/**
 * Interface For Alert Dialog data
 * @param message Message to be shown in the alert box
 * @param buttonText Text to be shown on the confirmation button
 */
interface AlertDialogData {
  message: string;
  buttonText?: string;
}

/**
 * Class For Alert Modal Component
 */
@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.css']
})
export class AlertModalComponent {
  /**
   * Constructor For Alert Modal
   * @param dialogRef Material Dialog Reference
   * @param data Data to be used in the alert box
   */
  constructor(public dialogRef: MatDialogRef<AlertModalComponent>, @Inject(MAT_DIALOG_DATA) public data: AlertDialogData) { }

  close(): void {
    // Close Dialog
    this.dialogRef.close();
  }
}
