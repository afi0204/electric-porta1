import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ElectricDevice, ElectricReading } from '../../models/device.model';
import { ConsumptionLineChartComponent } from '../consumption-line-chart/consumption-line-chart.component';
import { DayNightPieChartComponent } from '../day-night-pie-chart/day-night-pie-chart.component';
import { CumulativeChartComponent } from '../cumulative-chart/cumulative-chart.component';
@Component({
  selector: 'app-analytics-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConsumptionLineChartComponent, DayNightPieChartComponent,CumulativeChartComponent],
  templateUrl: './analytics-modal.component.html',
  styleUrls: ['./analytics-modal.component.css']
})
export class AnalyticsModalComponent implements OnChanges {
  @Input() device: ElectricDevice | null = null;
  @Output() closeModal = new EventEmitter<void>();

  isLoading = true;
  // NEW: A flag to control when charts are added to the DOM
  renderCharts = false;
  period: '24h' | '7d' | '30d' | '90d' = '30d';
  deviceReadings: ElectricReading[] = [];

  constructor(private apiService: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['device'] && this.device) {
      // When the modal opens, reset the state
      this.renderCharts = false;
      this.loadChartData();
    }
  }

  loadChartData(): void {
    if (!this.device) return;
    this.isLoading = true;
    this.apiService.getDeviceReadings(this.device.deviceId, this.period).subscribe(readings => {
      this.deviceReadings = [...readings];
      this.isLoading = false;

      // THE FIX: Use setTimeout to delay rendering the charts.
      // This gives the modal's animation time to finish and its container a defined size.
      setTimeout(() => {
        this.renderCharts = true;
      }, 100); // 100ms delay
    });
  }

  onPeriodChange(newPeriod: any): void {
      this.period = newPeriod;
      this.loadChartData();
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }
}
