import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ConsumptionReportItem } from '../../../../models/device.model';

@Component({
  selector: 'app-time-series-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `<canvas baseChart [data]="lineChartData" [options]="lineChartOptions" [type]="'line'"></canvas>`
})
export class TimeSeriesChartComponent implements OnChanges {
  @Input() data: ConsumptionReportItem[] = [];
  @Input() fromDate?: Date | string;
  @Input() toDate?: Date | string;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartOptions: ChartOptions = { responsive: true, maintainAspectRatio: false };
  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [], label: 'Daily Total (kWh)', tension: 0.4, fill: 'origin',
      borderColor: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.2)'
    }]
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.processChartData();
    }
  }

  processChartData() {
    const dailyData = new Map<string, number>();
    this.data.forEach(item => {
      item.dailyConsumption.forEach(daily => {
        const dateKey = new Date(daily.date).toLocaleDateString([], { month: 'short', day: 'numeric' });
        dailyData.set(dateKey, (dailyData.get(dateKey) || 0) + daily.consumption);
      });
    });

    const sortedLabels = [...dailyData.keys()].sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

    this.lineChartData.labels = sortedLabels;
    this.lineChartData.datasets[0].data = sortedLabels.map(label => dailyData.get(label) || 0);
    this.chart?.update();
  }
}
