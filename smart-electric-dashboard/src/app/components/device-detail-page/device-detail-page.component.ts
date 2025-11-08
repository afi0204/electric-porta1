import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // DatePipe is part of CommonModule
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { ElectricDevice, ElectricReading, StatCardData, DeviceLog } from '../../models/device.model';

import { StatCardsComponent } from '../stat-cards/stat-cards.component';
import { ConsumptionLineChartComponent } from '../consumption-line-chart/consumption-line-chart.component';
import { DayNightPieChartComponent } from '../day-night-pie-chart/day-night-pie-chart.component';
import { RealTimeChartComponent } from '../real-time-chart/real-time-chart.component';

@Component({
  selector: 'app-device-detail-page',
  standalone: true,
  imports: [
    CommonModule, // No need to import DatePipe separately
    RouterLink,
    FormsModule,
    StatCardsComponent,
    ConsumptionLineChartComponent,
    DayNightPieChartComponent,
    RealTimeChartComponent
  ],
  templateUrl: './device-detail-page.component.html',
  styleUrls: ['./device-detail-page.component.css']
})
export class DeviceDetailPageComponent implements OnInit, OnDestroy {
  // Add new properties for unit conversion
  consumptionUnit: 'kWh' | 'Wh' = 'Wh';
  private refreshInterval: any;

  // Add new methods for unit conversion
  formatConsumption(volume: number | undefined): number {
    if (volume === undefined) return 0;
    return this.consumptionUnit === 'kWh' ? volume / 1000 : volume;
  }

  updateConsumptionUnit() {
    // No additional logic needed as the formatConsumption handles it
  }

  device: ElectricDevice | null = null;
  deviceReadings: ElectricReading[] = [];
  statCards: StatCardData[] = [];
  isLoading = true;
  period: '24h' | '7d' | '30d' | '90d' = '30d';

  public selectedDate: string = this.formatDateForInput(new Date());
  public dailyReadings: ElectricReading[] = [];
  public dailyLoading = false;
  public dailyError: string | null = null;

  // --- NEW FOR LOGS ---
  public deviceLogs: DeviceLog[] = [];
  public newLogComment = '';
  public newLogStatus = 'active'; // Default new status
  public isSubmittingLog = false;
  public logSubmitError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const deviceId = this.route.snapshot.paramMap.get('id');
    if (deviceId) {
      this.loadAllData(deviceId);
      this.loadDailyDetailData(deviceId, this.selectedDate);

      // Set up refresh interval based on period
      this.refreshInterval = setInterval(() => {
        if (this.period === '24h') {
          this.loadDailyDetailData(deviceId, this.selectedDate);
        } else {
          this.loadAllData(deviceId);
        }
      }, 100000);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadAllData(deviceId: string): void {
    this.isLoading = true;

    // Use forkJoin to run both API calls at the same time.
    // The 'subscribe' block will only run after BOTH are complete.
    forkJoin({
      device: this.apiService.getDeviceById(deviceId),
      readings: this.period === '24h' ?
        this.apiService.getDeviceDailyDetail(deviceId, this.selectedDate) :
        this.apiService.getDeviceReadings(deviceId, this.period as '7d' | '30d' | '90d'),
      logs: this.apiService.getDeviceLogs(deviceId).pipe(
        catchError(err => {
          console.error("Failed to load device logs, continuing without them.", err);
          // Return an empty array so forkJoin doesn't fail the other requests.
          return of([]);
        })
      )
    }).subscribe({
      next: ({ device, readings, logs }) => {
        // Now we have both the device details and the readings data
        this.device = device;
        this.deviceReadings = readings;
        this.deviceLogs = logs; // Store the logs (or an empty array on error)

        this.calculateStats(); // Calculate stats with the new data
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Failed to load critical device details:", err);
        // You could navigate away or show a permanent error message here
        this.isLoading = false;
      }
    });
  }

  loadDailyDetailData(deviceId: string, date: string): void {
    this.dailyLoading = true;
    this.dailyError = null;
    this.apiService.getDeviceDailyDetail(deviceId, date).subscribe({
      next: (readings) => {
        this.dailyReadings = readings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        this.dailyLoading = false;
      },
      error: (err) => {
        this.dailyError = "No detailed data found for this day.";
        this.dailyReadings = [];
        this.dailyLoading = false;
      }
    });
  }

  onPeriodChange(newPeriod: any): void {
    this.period = newPeriod;
    if (this.device) {
      this.loadAllData(this.device.deviceId);
    }
  }

  onDateChange(newDate: string): void {
    this.selectedDate = newDate;
    if (this.device) {
      this.loadDailyDetailData(this.device.deviceId, this.selectedDate);
    }
  }

  calculateStats(): void {
    let dayUsage = 0, nightUsage = 0, totalUsage = 0;
    this.deviceReadings.forEach(r => {
      totalUsage += r.consumptionSinceLast;
      const hour = new Date(r.timestamp).getHours();
      (hour >= 6 && hour < 18) ? dayUsage += r.consumptionSinceLast : nightUsage += r.consumptionSinceLast;
    });
    const costPerKwh = 0.12;

    // Get latest battery voltage
    const sortedReadings = [...this.deviceReadings].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latestBattery = sortedReadings[0]?.batteryVoltage;

    this.statCards = [
      { title: `Total (${this.period})`, value: `${totalUsage.toLocaleString()} Wh`, icon: 'fas fa-bolt' },
      { title: 'Day Usage', value: `${dayUsage.toLocaleString()} Wh`, icon: 'fas fa-sun' },
      { title: 'Night Usage', value: `${nightUsage.toLocaleString()} Wh`, icon: 'fas fa-moon' },
      { title: 'Est. Cost', value: `$${(totalUsage * costPerKwh).toFixed(2)}`, icon: 'fas fa-dollar-sign' },
      { title: 'Battery Voltage', value: latestBattery ? `${latestBattery}V` : 'N/A', icon: 'fas fa-battery-full' }
    ];
  }


  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --- NEW METHOD ---
  submitLog(): void {
    if (!this.device || !this.newLogComment.trim() || this.isSubmittingLog) return;

    this.isSubmittingLog = true;
    this.logSubmitError = null;


const newLog = {
  deviceId: this.device.deviceId,
  author: 'Admin Tech',
  comment: this.newLogComment,
  newStatus: this.newLogStatus,
};
  this.apiService.addDeviceLog(this.device.deviceId, newLog).pipe(
    finalize(() => this.isSubmittingLog = false)
  ).subscribe({
    next: () => {
      this.loadAllData(this.device!.deviceId);
      this.newLogComment = '';
    },
    error: (err) => {
      console.error('Failed to submit log', err);
      this.logSubmitError = 'An unexpected error occurred. Please try again.';
    }
  });
}}
