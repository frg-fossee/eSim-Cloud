import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

/**
 * Interface For Confirm Dialog data
 * @param message Message to be shown in the confirm box
 * @param yesButtonText Text to be shown on the confirmation button
 * @param noButtonText Text to be shown on the confirmation button
 * @param yesFunction Callback function after clicking yes
 * @param noFunction Callback function after clicking no
 */
interface ConfirmDialogData {
  message: string;
  yesButtonText?: string;
  noButtonText?: string;
  cancelButtonText?: string;
  yesFunction: () => any;
  noFunction?: () => any;
  cancelFunction?: () => any;
}

/**
 * Class For Confirm Modal Component
 */
@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent {
  /**
   * Constructor For Alert Modal
   * @param dialogRef Material Dialog Reference
   * @param data Data to be used in the alert box
   */
  constructor(public dialogRef: MatDialogRef<ConfirmModalComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) { }

  onConfirm(): void {
    // Close the dialog, return true
    this.dialogRef.close(true);
  }

  onDeny(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

  onCancel(): void {
    // Close the dialog, return null
    this.dialogRef.close(null);
  }
}
