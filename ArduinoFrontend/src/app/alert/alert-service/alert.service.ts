import { Injectable } from '@angular/core';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { MatDialog } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private dialog: MatDialog) { }

  showAlert(message: string, buttonText: string = 'OK') {
    const dialogRef = this.dialog.open(AlertModalComponent, {
      data: { message, buttonText }
    });
    dialogRef.afterClosed();
  }
}
