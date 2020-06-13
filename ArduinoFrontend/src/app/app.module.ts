import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SimulatorComponent } from './simulator/simulator.component';

import { MonacoEditorModule } from 'ngx-monaco-editor';
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
} from '@angular/material';
import {MatTooltipModule} from '@angular/material/tooltip';
import { ViewComponentInfoComponent } from './view-component-info/view-component-info.component';
import { HttpClientModule } from '@angular/common/http';
import { ExportfileComponent } from './exportfile/exportfile.component';
import { ComponentlistComponent } from './componentlist/componentlist.component';
import { MatIconModule } from '@angular/material/icon';
import { FrontPageComponent } from './front-page/front-page.component';
import { GalleryComponent } from './gallery/gallery.component';
import { HeaderComponent } from './header/header.component';
import { ViewProjectComponent } from './view-project/view-project.component';

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
    HttpClientModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  // providers: [{provide: LocationStrategy, useClass: PathLocationStrategy}],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent],
  entryComponents: [ViewComponentInfoComponent, ExportfileComponent, ComponentlistComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  exports: [HeaderComponent]
})
export class AppModule { }
