import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef } from '@angular/material/dialog';

interface DialogData {
  onChangeProjectTitle: any;
  projectTitle: string;
}

/**
 * Class For Confirm Modal Component
 */
@Component({
  selector: 'app-save-project-dialog',
  templateUrl: './save-project-dialog.component.html',
})
export class SaveProjectDialogComponent {
  projectTitle: string;
  onChangeProjectTitle: any;

  /**
   * Constructor For Save Project Modal
   * @param dialogRef Material Dialog Reference
   * @param data Data to be used in the alert box
   */
  constructor(public dialogRef: MatDialogRef<SaveProjectDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.projectTitle = data.projectTitle || '';
    this.onChangeProjectTitle = data.onChangeProjectTitle;
  }

  onChange(e): void {
    this.projectTitle = this.onChangeProjectTitle(e);
  }

  onSave(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
