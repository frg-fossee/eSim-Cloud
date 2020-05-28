import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SimulatorComponent } from './simulator/simulator.component';
import { FrontPageComponent } from './front-page/front-page.component';

const routes: Routes = [
  { path: '', component: FrontPageComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'simulator', component: SimulatorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
