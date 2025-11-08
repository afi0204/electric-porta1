import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PaginatedList } from '../../models/device.model';
import { Chart } from 'chart.js/auto';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';
import { AppStateService } from '../../services/app-state.service';

import { FormatStatusPipe } from '../../pipes/format-status-pipe';
import { StatusIconPipe } from '../../pipes/status-icon-pipe';

import { DeviceQueryParams, ElectricDevice, ElectricReading } from '../../models/device.model';

import { MainAnalyticsChartComponent } from '../main-analytics-chart/main-analytics-chart.component';
import { DeviceModalComponent } from '../device-modal/device-modal.component';
import { AnalyticsModalComponent } from '../analytics-modal/analytics-modal.component';
import { SparklineChartComponent } from '../shared/charts/sparkline-chart/sparkline-chart.component';
import { ConsumptionLineChartComponent } from '../consumption-line-chart/consumption-line-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DecimalPipe,
    FormatStatusPipe,
    StatusIconPipe,
    MainAnalyticsChartComponent,
    DeviceModalComponent,
    AnalyticsModalComponent,
    SparklineChartComponent,
    ConsumptionLineChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  // UI State
  currentPage = 1;
  displayUnit: 'kWh' | 'Wh' = 'Wh';
  pageSize = 12;
  searchTerm = '';
  statusFilter = '';
  sortKey: 'lastReadingTimestamp' | 'name' | 'location' = 'lastReadingTimestamp';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Consumption tracking
  currentPageTotalConsumption = 0;
  filteredDevices: ElectricDevice[] = [];

  // Modals
  deviceForModal: ElectricDevice | null = null;
  deviceForAnalytics: ElectricDevice | null = null;
  showConsumptionModal = false;
  consumptionModalData: { date: Date; consumption: number }[] = [];

  constructor(
    public appState: AppStateService,
    private apiService: ApiService,
    private router: Router // ✅ Injected Router
  ) {
    // Calculate total when devices change
    this.appState.devices$.subscribe(devices => {
      if (devices?.items) {
        this.filteredDevices = devices.items;
        this.calculateCurrentPageTotal();
      }
    });
  }

  calculateCurrentPageTotal(): void {
    this.currentPageTotalConsumption = this.filteredDevices.reduce(
      (total, device) => total + (device.lastKnownVolume || 0),
      0
    );
  }

  getDailyConsumptionData(): { date: Date; consumption: number }[] {
    // Group readings by day up to past 7 days
    const dailyData = new Map<string, number>();
    const today = new Date();

    // Initialize with empty data for past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dailyData.set(date.toDateString(), 0);
    }

    // Sum device readings by day
    this.filteredDevices.forEach(device => {
      if (device.lastReadingTimestamp) {
        const date = new Date(device.lastReadingTimestamp).toDateString();
        if (dailyData.has(date)) {
          dailyData.set(date, (dailyData.get(date) || 0) + (device.lastKnownVolume || 0));
        }
      }
    });

    // Convert to array of {date, consumption} objects
    return Array.from(dailyData.entries()).map(([dateStr, consumption]) => ({
      date: new Date(dateStr),
      consumption: this.formatVolume(consumption) // Use current display unit
    }));
  }

  toggleUnit(): void {
    this.displayUnit = this.displayUnit === 'kWh' ? 'Wh' : 'kWh';
  }

  formatVolume(volume: number | undefined): number {
    if (volume === undefined) return 0;
    return this.displayUnit === 'kWh' ? volume / 1000 : volume;
  }

  triggerRefresh(): void {
    const params: DeviceQueryParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm,
      status: this.statusFilter,
      sortBy: this.sortKey,
      sortOrder: this.sortOrder
    };
    this.appState.refreshAllData(params);
  }

  onFilterOrSortChange(): void {
    this.currentPage = 1;
    this.triggerRefresh();
  }

  filterByStatus(status: string): void {
    this.statusFilter = this.statusFilter === status ? '' : status;
    this.onFilterOrSortChange();
  }

  setSort(newSortKey: 'name' | 'location'): void {
    if (this.sortKey === newSortKey) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = newSortKey;
      this.sortOrder = 'desc';
    }
    this.onFilterOrSortChange();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.triggerRefresh();
  }

  forceRefresh(): void {
    this.triggerRefresh();
  }

  resolveDeviceAlert(device: ElectricDevice, event: MouseEvent): void {
    event.stopPropagation();
    this.apiService.resolveAlert(device.deviceId).subscribe(() => this.triggerRefresh());
  }

  openDeviceModal(device: ElectricDevice): void {
    this.deviceForModal = device;
  }

  closeDeviceModal(): void {
    this.deviceForModal = null;
  }

  openAnalyticsModal(device: ElectricDevice): void {
    this.deviceForAnalytics = device;
    this.closeDeviceModal();
  }

  closeAnalyticsModal(): void {
    this.deviceForAnalytics = null;
  }

  onDeviceUpdated(updatedDevice: ElectricDevice): void {
    this.triggerRefresh();
    this.closeDeviceModal();
  }

  openConsumptionModal(): void {
    this.consumptionModalData = this.getDailyConsumptionData();
    this.showConsumptionModal = true;
  }

  convertToReadings(data: {date: Date; consumption: number}[]): any[] {
    return data.map(item => ({
      timestamp: item.date.toISOString(),
      consumptionSinceLast: item.consumption,
      deviceId: 'aggregated',
      readingId: Math.random().toString(36).substring(2, 9),
      volume: 0,
      networkSignal: 100
    }));
  }

  closeConsumptionModal(): void {
    this.showConsumptionModal = false;
  }

  isAlertStatus(status: string): boolean {
    return ['alert', 'cover_open', 'reversed', 'terminal_open'].includes(status);
  }

  getAlertClass(status: string): string {
    return this.isAlertStatus(status) ? `alert-row alert-row-${status}` : '';
  }

  getAvatarClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'cover_open':
      case 'reversed':
      case 'terminal_open':
        return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'cover_open':
      case 'reversed':
      case 'terminal_open':
        return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getLowSignalDevices(): ElectricDevice[] {
    let lowSignalDevices: ElectricDevice[] = [];
    this.appState.devices$.subscribe(devices => {
      if (devices?.items) {
        lowSignalDevices = devices.items.filter((device: ElectricDevice) =>
          device.networkSignal !== undefined && device.networkSignal < 30
        );
      }
    });
    return lowSignalDevices;
  }

  needsAttention(): boolean {
    return this.getLowSignalDevices().length > 0;
  }

  navigateToDevice(deviceId: string): void {
    this.router.navigate(['/device', deviceId]);
  }
}
