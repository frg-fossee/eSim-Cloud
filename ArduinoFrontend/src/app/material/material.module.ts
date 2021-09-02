import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Material from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    Material.MatDialogModule,
    Material.MatInputModule,
    Material.MatButtonModule,
    Material.MatTableModule,
    Material.MatRadioModule,
    Material.MatDividerModule,
    Material.MatTabsModule,
    Material.MatSnackBarModule,
    Material.MatIconModule,
    Material.MatTooltipModule,
    Material.MatGridListModule,
    Material.MatFormFieldModule,
    Material.MatSelectModule,
    Material.MatCheckboxModule,
    Material.MatToolbarModule,
    BrowserAnimationsModule,
    Material.MatRippleModule,
    Material.MatCardModule,
    Material.MatTableModule,
    Material.MatSortModule,
    Material.MatPaginatorModule,
  ],
  exports: [
    Material.MatDialogModule,
    Material.MatInputModule,
    Material.MatButtonModule,
    Material.MatTableModule,
    Material.MatRadioModule,
    Material.MatDividerModule,
    Material.MatTabsModule,
    Material.MatSnackBarModule,
    Material.MatIconModule,
    Material.MatTooltipModule,
    Material.MatGridListModule,
    Material.MatFormFieldModule,
    Material.MatSelectModule,
    Material.MatCheckboxModule,
    BrowserAnimationsModule,
    Material.MatRippleModule,
    Material.MatCardModule,
    Material.MatTableModule,
    Material.MatSortModule,
    Material.MatPaginatorModule,
  ]
})
export class MaterialModule { }
