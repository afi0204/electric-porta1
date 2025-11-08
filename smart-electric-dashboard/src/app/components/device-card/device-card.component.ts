import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ElectricDevice } from '../../models/device.model';

@Component({
  selector: 'app-device-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="card" [ngClass]="'status-' + (device.status || 'unknown')">
      <h3>{{ device.name }}</h3>
      <p>ID: {{ device.deviceId }}</p>
      <p>Status: <span class="status-badge">{{ device.status }}</span></p>
      <!-- Battery info is removed -->
      <p>Signal: {{ device.networkSignal }}%</p>
      <p>Last Reading: {{ device.lastReadingTimestamp | date:'short' }}</p>
    </div>
  `
  // You can add styles here or in a separate file
})
export class DeviceCardComponent {
  @Input() device!: ElectricDevice;
}
