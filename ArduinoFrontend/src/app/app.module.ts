import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SimulatorComponent } from './simulator/simulator.component';

import { MonacoEditorModule } from 'ngx-monaco-editor';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatDialogModule,
  MatInputModule,
  MatButtonModule,
  MatTableModule,
  MatRadioModule,
  MatDividerModule,
  MatTabsModule
} from '@angular/material';
import { ViewComponentInfoComponent } from './view-component-info/view-component-info.component';
import { HttpClientModule } from '@angular/common/http';
import { ExportfileComponent } from './exportfile/exportfile.component';
import { ComponentlistComponent } from './componentlist/componentlist.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SimulatorComponent,
    CodeEditorComponent,
    ViewComponentInfoComponent,
    ExportfileComponent,
    ComponentlistComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MonacoEditorModule.forRoot(),
    BrowserAnimationsModule,
    MatDialogModule,
    MatRadioModule,
    MatDividerModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [ViewComponentInfoComponent, ExportfileComponent, ComponentlistComponent]
})
export class AppModule { }
