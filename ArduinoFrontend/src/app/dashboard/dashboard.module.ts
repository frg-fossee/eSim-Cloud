import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '../common/material.module';
import { SharedModule } from '../common/SharedModule.module';
import { GalleryComponent } from '../gallery/gallery.component';
import { MainPageComponent } from '../main-page/main-page.component';
import { SidePanelComponent } from '../side-panel/side-panel.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({
    declarations: [
        DashboardComponent,
        GalleryComponent,
        MainPageComponent,
        SidePanelComponent,
        
    ],
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        SharedModule,
        ReactiveFormsModule,
        DashboardRoutingModule
    ],

    exports: []
})

export class DashboardModule { }
