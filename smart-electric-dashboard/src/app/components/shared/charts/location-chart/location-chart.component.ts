import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ConsumptionReportItem } from '../../../../models/device.model';

@Component({
  selector: 'app-location-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `<canvas baseChart [data]="barChartData" [options]="barChartOptions" [type]="'bar'"></canvas>`
})
export class LocationChartComponent implements OnChanges {
  @Input() data: ConsumptionReportItem[] = [];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };
  public barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Total Consumption (kWh)', backgroundColor: '#4A90E2', borderRadius: 4 }]
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.processChartData();
    }
  }

  processChartData() {
    const locationData = new Map<string, number>();
    this.data.forEach(item => {
      const loc = item.location || 'Unknown';
      locationData.set(loc, (locationData.get(loc) || 0) + item.totalConsumption);
    });

    this.barChartData.labels = [...locationData.keys()];
    this.barChartData.datasets[0].data = [...locationData.values()];
    this.chart?.update();
  }
}
