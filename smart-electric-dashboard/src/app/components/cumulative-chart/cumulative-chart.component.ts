import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ElectricReading } from '../../models/device.model';

@Component({
  selector: 'app-cumulative-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <h5>Cumulative Consumption (kWh)</h5>
    <div class="chart-wrapper">
      <canvas baseChart
              [data]="lineChartData"
              [options]="lineChartOptions"
              [type]="'line'">
      </canvas>
    </div>
  `,
  styles: [`.chart-wrapper { height: 220px; }`]
})
export class CumulativeChartComponent implements OnChanges {
  @Input() readings: ElectricReading[] = [];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: false } }, // Cumulative doesn't need to start at zero
    plugins: { legend: { display: false } }
  };
  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Total Volume (kWh)',
      tension: 0.2,
      fill: 'origin',
      borderColor: '#28a745', // Green for cumulative growth
      backgroundColor: 'rgba(40, 167, 69, 0.2)',
      pointBackgroundColor: '#28a745'
    }]
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readings']) {
      this.updateChart();
    }
  }

  updateChart() {
    if (!this.readings || this.readings.length === 0) return;

    const sortedReadings = [...this.readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // This is the key part: we plot the raw 'volume' for the cumulative chart.
    this.lineChartData.labels = sortedReadings.map(r => new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }));
    this.lineChartData.datasets[0].data = sortedReadings.map(r => r.volume);

    this.chart?.update(); // Force the chart to redraw
  }
}
