import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GalleryComponent } from '../gallery/gallery.component';
import { MainPageComponent } from '../main-page/main-page.component';
import { DashboardComponent } from './dashboard.component';
import { SimulatorComponent } from '../simulator/simulator.component';


const routes: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            {
                path: '',
                component: MainPageComponent

            },
            {
                path: 'gallery',
                component: GalleryComponent
            },
            {
                path: 'mainpage/:id',
                component: MainPageComponent
            },
            {
                path: 'simulator',
                redirectTo: '/simulator',
                pathMatch: 'full'
            }

        ]
    },
    {
        path: 'dashboard/simulator',
        redirectTo: '/simulator',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
