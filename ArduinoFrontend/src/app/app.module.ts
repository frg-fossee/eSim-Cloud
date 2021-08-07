import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  MatTooltipModule,
  MatExpansionModule,
  MatMenuModule
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
import { ExitConfirmDialogComponent } from './exit-confirm-dialog/exit-confirm-dialog.component';
import { SaveProjectDialogComponent } from './simulator/save-project-dialog/save-project-dialog.component';
import { OptionModalComponent } from './alert/option-modal/option-modal.component';
import { VersioningPanelComponent } from './versioning-panel/versioning-panel.component';
import { CreateVariationDialogComponent } from './versioning-panel/create-variation-dialog/create-variation-dialog.component';

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
    OptionModalComponent,
    ExportJSONDialogComponent,
    ExitConfirmDialogComponent,
    SaveProjectDialogComponent,
    VersioningPanelComponent,
    CreateVariationDialogComponent,
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
    MatSnackBarModule,
    MatExpansionModule,
    ReactiveFormsModule,
    MatMenuModule
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
    OptionModalComponent,
    ExportJSONDialogComponent,
    ExitConfirmDialogComponent,
    SaveProjectDialogComponent,
    CreateVariationDialogComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  exports: [HeaderComponent]
})
export class AppModule { }
