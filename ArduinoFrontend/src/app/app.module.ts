import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SimulatorComponent } from './simulator/simulator.component';

import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { PathLocationStrategy, LocationStrategy } from '@angular/common';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import {
  MatDialogModule,
  MatInputModule,
  MatButtonModule,
  MatTableModule,
  MatRadioModule,
  MatDividerModule,
  MatTabsModule,
  MatSnackBarModule,
  MatIconModule,
  MatTooltipModule
} from '@angular/material';
import { ViewComponentInfoComponent } from './view-component-info/view-component-info.component';
import { HttpClientModule } from '@angular/common/http';
import { ExportfileComponent } from './exportfile/exportfile.component';
import { ComponentlistComponent } from './componentlist/componentlist.component';
import { FrontPageComponent } from './front-page/front-page.component';
import { GalleryComponent } from './gallery/gallery.component';
import { HeaderComponent } from './header/header.component';
import { ViewProjectComponent } from './view-project/view-project.component';
import { AlertModalComponent } from './alert/alert-modal/alert-modal.component';
import { ConfirmModalComponent } from './alert/confirm-modal/confirm-modal.component';
import { ExportJSONDialogComponent } from './export-jsondialog/export-jsondialog.component';

/**
 * Monaco OnLoad Function
 */
export function onMonacoLoad() { }

/**
 * Monaco editor config for loading js files
 */
const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: './assets',
  defaultOptions: { scrollBeyondLastLine: false },
  onMonacoLoad
};



@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SimulatorComponent,
    CodeEditorComponent,
    ViewComponentInfoComponent,
    ExportfileComponent,
    ComponentlistComponent,
    FrontPageComponent,
    GalleryComponent,
    ViewProjectComponent,
    HeaderComponent,
    AlertModalComponent,
    ConfirmModalComponent,
    ExportJSONDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MonacoEditorModule.forRoot(monacoConfig),
    BrowserAnimationsModule,
    MatDialogModule,
    MatRadioModule,
    MatDividerModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    HttpClientModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  // providers: [{provide: LocationStrategy, useClass: PathLocationStrategy}],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent],
  entryComponents: [
    ViewComponentInfoComponent,
    ExportfileComponent,
    ComponentlistComponent,
    AlertModalComponent,
    ConfirmModalComponent,
    ExportJSONDialogComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  exports: [HeaderComponent]
})
export class AppModule { }
