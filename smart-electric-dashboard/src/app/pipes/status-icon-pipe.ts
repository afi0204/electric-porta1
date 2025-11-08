import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusIcon',
  standalone: true
})
export class StatusIconPipe implements PipeTransform {
  transform(status: string | null | undefined): string {
    switch (status) {
      case 'active': return 'fas fa-bolt';
      case 'maintenance': return 'fas fa-tools';
      case 'cover_open': return 'fas fa-door-open';
      case 'reversed': return 'fas fa-retweet';
      case 'terminal_open': return 'fas fa-terminal';
      default: return 'fas fa-question-circle';
    }
  }
}
