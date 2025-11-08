import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReportsComponent } from './components/reports/reports.component';
// Import the new component
import { DeviceDetailPageComponent } from './components/device-detail-page/device-detail-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'reports', component: ReportsComponent },
    // NEW: This is a dynamic route. The ':id' will be the actual device ID.
    { path: 'device/:id', component: DeviceDetailPageComponent }
];
