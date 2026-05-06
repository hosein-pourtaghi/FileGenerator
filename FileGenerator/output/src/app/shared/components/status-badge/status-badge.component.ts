
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: false,
  template: `
    <span class="status-badge" [ngClass]="badgeClass">
      <span class="status-dot"></span>
      {{ displayText }}
    </span>
  `,
  styles: [`
    @use '../../../styles/variables' as vars;
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      
      &.active, &.success, &.true {
        background: rgba(76, 175, 80, 0.1);
        color: vars.$success-color;
        
        .status-dot {
          background: vars.$success-color;
        }
      }
      
      &.inactive, &.error, &.false {
        background: rgba(244, 67, 54, 0.1);
        color: vars.$warn-color;
        
        .status-dot {
          background: vars.$warn-color;
        }
      }
      
      &.pending, &.warning {
        background: rgba(255, 152, 0, 0.1);
        color: vars.$warning-color;
        
        .status-dot {
          background: vars.$warning-color;
        }
      }
      
      &.info {
        background: rgba(33, 150, 243, 0.1);
        color: #2196F3;
        
        .status-dot {
          background: #2196F3;
        }
      }
    }
    
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
  `],
  imports: [CommonModule]
})
export class StatusBadgeComponent {
  @Input() status: boolean | string = false;
  @Input() activeText = 'فعال';
  @Input() inactiveText = 'غیرفعال';

  get badgeClass(): string {
    if (typeof this.status === 'boolean') {
      return this.status ? 'active' : 'inactive';
    }
    return this.status.toLowerCase();
  }

  get displayText(): string {
    if (typeof this.status === 'boolean') {
      return this.status ? this.activeText : this.inactiveText;
    }
    return this.status;
  }
}
9. Shared Pipes
src/app/shared/pipes/persian-date.pipe.ts
typescript

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'persianDate',
  standalone: false
})
export class PersianDatePipe implements PipeTransform {
  private persianDays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  private persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  transform(value: string | Date | null | undefined, format: 'full' | 'date' | 'time' | 'short' = 'full'): string {
    if (!value) return '';

    const date = new Date(value);
    if (isNaN(date.getTime())) return '';

    const persianDate = this.toPersianDate(date);

    switch (format) {
      case 'date':
        return `${persianDate.year}/${persianDate.month}/${persianDate.day}`;
      case 'time':
        return `${persianDate.hour}:${persianDate.minute.toString().padStart(2, '0')}`;
      case 'short':
        return `${persianDate.year}/${persianDate.month}/${persianDate.day} - ${persianDate.hour}:${persianDate.minute.toString().padStart(2, '0')}`;
      case 'full':
      default:
        return `${this.persianDays[persianDate.dayOfWeek]}، ${persianDate.day} ${this.persianMonths[persianDate.month - 1]} ${persianDate.year} - ${persianDate.hour}:${persianDate.minute.toString().padStart(2, '0')}`;
    }
  }

  private toPersianDate(date: Date): any {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const dayOfWeek = date.getDay();