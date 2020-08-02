import { Injectable } from '@angular/core';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { MatDialog } from '@angular/material';

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

}
