import { Injectable } from '@angular/core';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { MatDialog } from '@angular/material';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private static dialog: MatDialog;

  constructor(private dialog: MatDialog) {
    AlertService.dialog = dialog;
  }

  static showAlert(message: string, buttonText: string = 'OK') {
    const dialogRef = AlertService.dialog.open(AlertModalComponent, {
      data: { message, buttonText }
    });
    dialogRef.afterClosed();
  }

  static showConfirm(message, yesFunction: () => any, noFunction?: () => any, yesButtonText: string = 'Yes', noButtonText: string = 'No') {
    const dialogRef = AlertService.dialog.open(ConfirmModalComponent, {
      data: {
        message,
        yesButtonText,
        noButtonText,
        yesFunction,
        noFunction,
      },
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value) {
        yesFunction();
      } else {
        noFunction();
      }
    });
  }

}
