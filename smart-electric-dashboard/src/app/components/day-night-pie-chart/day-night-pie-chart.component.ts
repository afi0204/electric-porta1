import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ElectricReading } from '../../models/device.model';

@Component({
  selector: 'app-day-night-pie-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <h5>Day vs. Night Usage</h5>
    <div style="height: 200px;">
      <canvas baseChart [data]="pieChartData" [options]="pieChartOptions" [type]="'pie'"></canvas>
    </div>
  `
})
export class DayNightPieChartComponent implements OnChanges {
  @Input() readings: ElectricReading[] = [];

  public pieChartOptions: ChartOptions = { responsive: true, maintainAspectRatio: false };
  public pieChartData: ChartConfiguration['data'] = {
    labels: ['Day Usage', 'Night Usage'],
    datasets: [{ data: [0, 0], backgroundColor: ['#ffc107', '#4b0082'] }]
  };

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readings']) {
      this.updateChart();
    }
  }

  updateChart() {
    if (!this.readings) return;
    let dayUsage = 0, nightUsage = 0;
    this.readings.forEach(r => {
      const hour = new Date(r.timestamp).getHours();
      (hour >= 6 && hour < 18) ? dayUsage += r.consumptionSinceLast : nightUsage += r.consumptionSinceLast;
    });
    this.pieChartData.datasets[0].data = [dayUsage, nightUsage];
  }
}
