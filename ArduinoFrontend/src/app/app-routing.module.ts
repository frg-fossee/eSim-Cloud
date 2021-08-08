import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SimulatorComponent } from './simulator/simulator.component';
import { FrontPageComponent } from './front-page/front-page.component';
import { GalleryComponent } from './gallery/gallery.component';
import {ViewProjectComponent} from './view-project/view-project.component';
import { LTIFormComponent } from './lti-form/lti-form.component';
import { SubmissionlistComponent } from './submissionlist/submissionlist.component';

const routes: Routes = [
  { path: '', component: FrontPageComponent },
  { path: 'project/:slug', component: ViewProjectComponent},
  { path: 'gallery', component: GalleryComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'simulator', component: SimulatorComponent },
  { path: 'lti', component: LTIFormComponent },
  { path: 'submissions', component: SubmissionlistComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
