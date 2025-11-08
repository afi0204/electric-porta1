import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ElectricDevice } from '../../models/device.model';

@Component({
  selector: 'app-device-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './device-modal.component.html',
  styleUrls: ['./device-modal.component.css'] // We'll create this CSS
})
export class DeviceModalComponent implements OnChanges {
  @Input() device: ElectricDevice | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() deviceUpdated = new EventEmitter<ElectricDevice>();
  @Output() viewAnalytics = new EventEmitter<void>(); // Emits to open the other modal

  isEditing = false;
  editableDevice: ElectricDevice | null = null;

  constructor(private apiService: ApiService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['device'] && this.device) {
      this.editableDevice = { ...this.device };
      this.isEditing = false;
    }
  }

  onClose() { this.closeModal.emit(); }
  enterEditMode() { this.isEditing = true; }
  cancelEdit() {
    this.editableDevice = { ...this.device! };
    this.isEditing = false;
  }

  saveChanges() {
    if (this.editableDevice) {
      this.apiService.updateDevice(this.editableDevice).subscribe({
        next: () => this.deviceUpdated.emit(this.editableDevice!),
        error: (err: any) => console.error("Failed to update device", err)
      });
    }
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }
}
