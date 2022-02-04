import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SimulatorComponent } from './simulator/simulator.component';
import { FrontPageComponent } from './front-page/front-page.component';
import { GalleryComponent } from './gallery/gallery.component';
import { ViewProjectComponent } from './view-project/view-project.component';
import { LTIFormComponent } from './lti-form/lti-form.component';
import { SubmissionlistComponent } from './submissionlist/submissionlist.component';

const routes: Routes = [
  { path: '', component: FrontPageComponent },
  { path: 'project/:slug', component: ViewProjectComponent },
  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule'
  },
  { path: 'simulator', component: SimulatorComponent },
  { path: 'lti', component: LTIFormComponent },
  { path: 'submissions', component: SubmissionlistComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
