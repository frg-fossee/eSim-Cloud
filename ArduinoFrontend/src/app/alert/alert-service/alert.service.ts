import { Injectable } from '@angular/core';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { MatDialog } from '@angular/material';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { OptionModalComponent } from '../option-modal/option-modal.component';

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

  static showOptions(
    message,
    option1Function: () => any,
    option2Function?: () => any,
    cancelFunction?: () => any,
    option1Text: string = 'Option 1',
    option2Text: string = 'Option 2',
    cancelButtonText: string = 'Cancel') {
    const dialogRef = AlertService.dialog.open(OptionModalComponent, {
      data: {
        message,
        option1Text,
        option2Text,
        cancelButtonText,
        option1Function,
        option2Function,
        cancelFunction,
      },
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value === 1) {
        option1Function();
      } else if (value === 2) {
        option2Function();
      } else {
        cancelFunction();
      }
    });
  }

  static showCustom(component, data, subscriber) {
    const dialogRef = AlertService.dialog.open(component, { data });
    dialogRef.afterClosed().subscribe(subscriber);
  }

}
