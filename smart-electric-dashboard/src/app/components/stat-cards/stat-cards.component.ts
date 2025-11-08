import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import the interface from our central model file
import { StatCardData } from '../../models/device.model';

@Component({
  selector: 'app-stat-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-cards-grid">
      <div class="card stat-card" *ngFor="let card of cards">
        <div class="stat-icon">
          <i [class]="card.icon"></i>
        </div>
        <div class="stat-content">
          <h4>{{ card.title }}</h4>
          <p class="value">{{ card.value }}</p>
        </div>
      </div>
    </div>
  `,
  // Add styles directly for simplicity
  styles: [`
    .stat-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; }
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .stat-icon { font-size: 1.5rem; color: var(--primary-blue); background-color: #e7f3ff; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
    .stat-content h4 { margin: 0 0 4px; font-size: 0.9rem; color: var(--text-muted-color); }
    .stat-content .value { margin: 0; font-size: 1.5rem; font-weight: 600; }
  `]
})
export class StatCardsComponent {
  // This component receives an array of card data from its parent.
  @Input() cards: StatCardData[] = [];
}
