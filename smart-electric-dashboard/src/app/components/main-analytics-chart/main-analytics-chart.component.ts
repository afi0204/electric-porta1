import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
// FIX #1: Import FormsModule
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { ElectricReading } from '../../models/device.model';

@Component({
  selector: 'app-main-analytics-chart',
  standalone: true,
  // FIX #2: Add FormsModule to the imports array
  imports: [CommonModule, BaseChartDirective, FormsModule],
  template: `
    <div class="chart-card-container">
      <div class="card-header">
        <h3>Electric Consumption</h3>
        <div class="chart-actions">
            <!-- Chart Type Toggle Buttons -->
            <button (click)="setChartType('line')" [class.active]="chartType === 'line'">
              <i class="fas fa-chart-line"></i>
            </button>
            <button (click)="setChartType('bar')" [class.active]="chartType === 'bar'">
              <i class="fas fa-chart-bar"></i>
            </button>
            <!-- Unit Selection Dropdown -->
            <select [(ngModel)]="selectedUnit" (change)="updateChartData()">
              <option value="kWh">kWh</option>
              <option value="Wh">Wh</option>
            </select>
        </div>
      </div>
      <div class="chart-wrapper">
          <div *ngIf="lineChartData.datasets[0].data.length > 0; else noData">
            <canvas baseChart
                    [data]="lineChartData"
                    [options]="lineChartOptions"
                    [type]="chartType">
            </canvas>
          </div>
          <ng-template #noData>
            <div class="no-data-placeholder">No consumption data for this period.</div>
          </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .chart-card-container { display: flex; flex-direction: column; height: 100%; }
    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 0 10px 10px 10px; }
    .card-header h3 { margin: 0; font-size: 1.1rem; }
    .chart-actions { display: flex; align-items: center; gap: 8px; }
    .chart-actions button {
      background-color: #f0f0f0;
      border: 1px solid #ddd;
      padding: 5px 10px;
      cursor: pointer;
      border-radius: 5px;
    }
    .chart-actions button.active {
      background-color: var(--primary-blue);
      color: white;
      border-color: var(--primary-blue);
    }
    .card-header select { padding: 4px 8px; border-radius: 5px; border: 1px solid #ddd; }
    .chart-wrapper { flex-grow: 1; position: relative; }
    canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    .no-data-placeholder { text-align: center; color: #999; padding: 40px 0; }
  `]
})
export class MainAnalyticsChartComponent implements OnChanges {
  @Input() readings: ElectricReading[] = [];
  selectedUnit: 'kWh' | 'Wh' = 'kWh';
  public chartType: ChartType = 'line';

  public lineChartOptions: ChartOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } };
  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Consumption (kWh)',
      tension: 0.4,
      fill: 'origin',
      borderColor: '#4A90E2',
      backgroundColor: 'rgba(74, 144, 226, 0.2)',
      pointBackgroundColor: '#4A90E2'
    }]
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readings'] && this.readings) {
      this.updateChartData();
    }
  }

  updateChartData(): void {
    const aggregatedData: { [key: string]: number } = {};
    const readingsToProcess = this.readings || [];

    readingsToProcess.forEach(r => {
      const key = new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
      aggregatedData[key] = (aggregatedData[key] || 0) + r.consumptionSinceLast;
    });

    const sortedLabels = Object.keys(aggregatedData).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

    const conversionFactor = this.selectedUnit === 'Wh' ? 1000 : 1;
    const dataPoints = sortedLabels.map(label => (aggregatedData[label] || 0) * conversionFactor);

    this.lineChartData.labels = sortedLabels;
    this.lineChartData.datasets[0].data = dataPoints;
    this.lineChartData.datasets[0].label = `Consumption (${this.selectedUnit})`;

    this.cdr.detectChanges();
  }

  setChartType(type: ChartType): void {
    this.chartType = type;
  }
}
