import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import routing tools
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AppStateService } from './services/app-state.service';
@Component({
  selector: 'app-root',
  standalone: true,
  // Add routing modules to the imports array
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'smart-electric-dashboard';

  public showNotificationDropdown = false; // Controls visibility

  // Make the service public so the template can access its observables (e.g., appState.stats$)
  constructor(public appState: AppStateService) {}

  // Toggles the dropdown visibility
  toggleNotificationDropdown(): void {
      this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  /**
   * Returns the appropriate Font Awesome icon class for a given device status.
   * This is still needed by the template for the notification dropdown.
   * @param status The status of the device (e.g., 'alert', 'cover_open').
   * @returns A string representing the icon class (e.g., 'fa-exclamation-triangle').
   */
  getIconForStatus(status: string): string {
    // All alert-like statuses will use the same icon for consistency.
    switch (status) {
      case 'alert':
      case 'cover_open':
      case 'reversed':
      case 'terminal_open':
        return 'fa-exclamation-triangle';
      default:
        // A generic icon for any other case.
        return 'fa-bolt';
    }
  }
}
