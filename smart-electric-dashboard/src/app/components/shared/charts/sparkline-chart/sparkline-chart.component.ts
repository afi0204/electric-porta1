import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-sparkline-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `<div style="height: 40px; width: 120px;"><canvas baseChart [data]="sparklineData" [options]="sparklineOptions" [type]="'line'"></canvas></div>`
})
export class SparklineChartComponent implements OnChanges {
  @Input() data: { date: Date; consumption: number }[] = [];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public sparklineOptions: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    elements: { point: { radius: 0 } }, // Hide points
    plugins: { legend: { display: false }, tooltip: { enabled: false } }, // Hide legend and tooltips
    scales: { x: { display: false }, y: { display: false } } // Hide axes
  };

  public sparklineData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [], borderWidth: 2,
      borderColor: '#007bff',
      fill: 'origin', backgroundColor: 'rgba(0, 123, 255, 0.1)'
    }]
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.updateChart();
    }
  }

  updateChart() {
    this.sparklineData.labels = this.data.map(d => new Date(d.date).toLocaleDateString());
    this.sparklineData.datasets[0].data = this.data.map(d => d.consumption);
    this.chart?.update();
  }
}
