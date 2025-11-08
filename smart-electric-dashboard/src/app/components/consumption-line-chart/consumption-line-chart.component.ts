import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ElectricReading } from '../../models/device.model';

@Component({
  selector: 'app-consumption-line-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  template: `
    <div class="chart-header">
      <h5>Consumption Trend ({{unit === 'kWh' ? 'kWh' : 'Wh'}})</h5>
      <div class="chart-controls">
        <select [(ngModel)]="unit" (ngModelChange)="updateChart()">
          <option value="kWh">kWh</option>
          <option value="Wh">Wh</option>
        </select>
        <select [(ngModel)]="chartType" (ngModelChange)="updateChart()">
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
        </select>
      </div>
    </div>
    <div class="chart-wrapper">
      <canvas baseChart
              [data]="chartData"
              [options]="chartOptions"
              [type]="chartType">
      </canvas>
    </div>
  `,
  styles: [`
    .chart-wrapper { height: 220px; }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .chart-controls select {
      margin-left: 10px;
      padding: 5px;
    }
  `]
})
export class ConsumptionLineChartComponent implements OnChanges {
  @Input() readings: ElectricReading[] = [];
  @Input() period: '24h' | '7d' | '30d' | '90d' = '7d';

  unit: 'kWh' | 'Wh' = 'kWh';
  chartType: 'line' | 'bar' = 'line';

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { display: false } }
  };

  private lineChartDataset = {
    type: 'line' as const,
    data: [] as number[],
    tension: 0.4,
    fill: 'origin' as const,
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    pointBackgroundColor: '#4A90E2',
    borderWidth: 2,
  };

  private barChartDataset = {
    type: 'bar' as const,
    data: [] as number[],
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderWidth: 1,
  };

  public chartData: ChartConfiguration<'line'|'bar'>['data'] = {
    labels: [],
    datasets: [this.lineChartDataset]
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readings'] || changes['period']) {
      this.updateChart();
    }
  }

  updateChart(): void {
    if (!this.readings || this.readings.length === 0) return;

    const conversionFactor = this.unit === 'kWh' ? 0.001 : 1;
    const aggregatedData = new Map<string, number>();

    this.readings.forEach(r => {
      let key: string;
      if (this.period === '24h') {
        // Format as hours for 24h view
        key = new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit' });
      } else {
        // Format as dates for longer periods
        key = new Date(r.timestamp).toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          ...(this.period === '7d' ? {} : { year: '2-digit' })
        });
      }

      const value = r.consumptionSinceLast * conversionFactor;
      aggregatedData.set(key, (aggregatedData.get(key) || 0) + value);
    });

    this.chartData.labels = [...aggregatedData.keys()];
    const currentData = [...aggregatedData.values()];

    // Use appropriate dataset based on chart type
    if (this.chartType === 'line') {
      this.chartData.datasets = [{
        ...this.lineChartDataset,
        data: currentData
      }];
    } else {
      this.chartData.datasets = [{
        ...this.barChartDataset,
        data: currentData
      }];
    }

    this.cdr.detectChanges();
  }
}
