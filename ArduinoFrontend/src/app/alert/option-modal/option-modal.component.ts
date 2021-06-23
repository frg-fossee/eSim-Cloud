import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

/**
 * Interface For option Dialog data
 * @param message Message to be shown in the option box
 * @param option1Text Text to be shown for option1 button
 * @param option2Text Text to be shown for option2 button
 * @param cancelButtonText Text to be shown for cancelling
 * @param option1Function Callback function after selecting option1
 * @param option2Function Callback function after selecting option2
 */
interface OptionDialogData {
  message: string;
  option1Text?: string;
  option2Text?: string;
  cancelButtonText?: string;
  option1Function: () => any;
  option2Function?: () => any;
  cancelFunction?: () => any;
}

/**
 * Class For Option Modal Component
 */
@Component({
  selector: 'app-option-modal',
  templateUrl: './option-modal.component.html',
  styleUrls: ['./option-modal.component.css']
})
export class OptionModalComponent {
  /**
   * Constructor For Alert Modal
   * @param dialogRef Material Dialog Reference
   * @param data Data to be used in the alert box
   */
  constructor(public dialogRef: MatDialogRef<OptionModalComponent>, @Inject(MAT_DIALOG_DATA) public data: OptionDialogData) { }

  onOption1(): void {
    // Close the dialog, return 1
    this.dialogRef.close(1);
  }

  onOption2(): void {
    // Close the dialog, return 2
    this.dialogRef.close(2);
  }

  onDismiss(): void {
    // Close the dialog, return 0
    this.dialogRef.close(0);
  }
}
