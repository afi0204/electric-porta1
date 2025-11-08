import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ElectricReading } from '../../models/device.model';

@Component({
  selector: 'app-real-time-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="chart-container">
      <canvas baseChart
              [data]="lineChartData"
              [options]="lineChartOptions"
              [type]="'line'">
      </canvas>
    </div>
  `,
  styles: [`.chart-container { height: 300px; }`]
})
export class RealTimeChartComponent implements OnChanges {
  @Input() readings: ElectricReading[] = [];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'Time of Day' }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Consumption (Wh)' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const reading = this.readings[context.dataIndex];
            let label = `Consumption: ${context.parsed.y} Wh`;
            if (reading.batteryVoltage !== undefined && reading.batteryVoltage !== null) {
              label += `, Battery: ${reading.batteryVoltage}V`;
            }
            return label;
          }
        }
      }
    }
  };

  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      tension: 0.1, // Less tension for a more "spiky" look
      borderColor: '#eb5757', // A red color for emphasis
      backgroundColor: 'rgba(235, 87, 87, 0.2)',
      fill: 'origin',
      pointRadius: 2,
    }]
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readings']) {
      this.updateChart();
    }
  }

  updateChart(): void {
    if (!this.readings || this.readings.length === 0) {
        this.lineChartData.labels = [];
        this.lineChartData.datasets[0].data = [];
    } else {
        // Format the X-axis labels to be HH:mm:ss
        this.lineChartData.labels = this.readings.map(r =>
          new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
        this.lineChartData.datasets[0].data = this.readings.map(r => r.consumptionSinceLast);
    }

    // Force the chart to redraw
    this.chart?.update();
  }
}
