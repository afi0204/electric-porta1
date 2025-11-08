import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
// Import the new chart components from their correct paths
import { LocationChartComponent } from '../shared/charts/location-chart/location-chart.component';
import { TimeSeriesChartComponent } from '../shared/charts/time-series-chart/time-series-chart.component';
import { SparklineChartComponent } from '../shared/charts/sparkline-chart/sparkline-chart.component';

import { ConsumptionReportItem, ElectricDevice } from '../../models/device.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LocationChartComponent,
    TimeSeriesChartComponent,
    SparklineChartComponent
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  // Form properties
  public fromDate: string = '';
  public toDate: string = '';
  public location: string = 'All';
  public availableLocations: string[] = [];

  // Report results
  public reportData: ConsumptionReportItem[] = [];
  public grandTotal = 0;
  public locationCount = 0;
  public isLoading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - 29);
    this.toDate = this.formatDate(today);
    this.fromDate = this.formatDate(from);

    // Use a simplified query to get devices for locations
    this.apiService.getDevices({ pageSize: 1000 }).subscribe(response => {
        this.availableLocations = [...new Set(response.items.map(d => d.location).filter(Boolean))].sort() as string[];
    });
  }

  generateReport(): void {
    this.isLoading = true;
    this.reportData = [];

    const query = {
      fromDate: new Date(this.fromDate),
      toDate: new Date(this.toDate),
      location: this.location
    };

    this.apiService.generateReport(query).subscribe({
      next: data => {
        this.reportData = data;
        this.grandTotal = data.reduce((sum, item) => sum + item.totalConsumption, 0);
        // Calculate the number of unique locations in the report
        this.locationCount = new Set(data.map(item => item.location)).size;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to generate report', err);
        this.isLoading = false;
      }
    });
  }

  // Placeholder for the sample data button
  generateSampleReport(): void {
      alert("Loading sample report data!");
      // Here you could populate this.reportData with hardcoded sample data
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
