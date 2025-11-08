import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatStatus',
  standalone: true // This makes it a standalone pipe
})
export class FormatStatusPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return 'Unknown';
    }
    // Replace underscore with space and capitalize the first letter of each word
    return value
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }
}
