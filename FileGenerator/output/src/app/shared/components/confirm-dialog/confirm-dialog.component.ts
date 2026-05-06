
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'انصراف' }}
        </button>
        <button 
          mat-flat-button 
          [color]="data.confirmColor || 'primary'"
          (click)="onConfirm()">
          {{ data.confirmText || 'تأیید' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 16px;
      min-width: 300px;
    }
    h2 {
      margin: 0 0 8px;
      font-size: 1.25rem;
    }
    p {
      color: rgba(0, 0, 0, 0.6);
      margin: 0;
    }
    mat-dialog-actions {
      margin-top: 16px;
      padding: 0;
      gap: 8px;
    }
  `],
  imports: [CommonModule, MatDialogModule, MatButtonModule]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
src/app/shared/components/page-header/page-header.component.ts
typescript

import { Component, Input } from '@angular/core';
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
      font-size: 0.875rem;
      
      .breadcrumb-item {
        color: vars.$text-secondary;
        text-decoration: none;
        display: flex;
        align-items: center;
        
        &:hover {
          color: vars.$primary-color;
        }
        
        &.active {
          color: vars.$text-primary;
        }
        
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
      
      .breadcrumb-separator {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: vars.$text-disabled;
      }
    }
    
    .title-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .header-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: vars.$primary-color;
    }
    
    .title {
      font-size: 1.75rem;
      font-weight: 500;
      margin: 0;
      color: vars.$text-primary;
    }
    
    .subtitle {
      margin: 4px 0 0;
      color: vars.$text-secondary;
      font-size: 0.95rem;
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  `],
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() breadcrumbs: string[] = [];
  @Input() actions: any[] = [];
}
src/app/shared/components/empty-state/empty-state.component.ts
typescript

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: false,
  template: `
    <div class="empty-state">
      <div class="empty-icon">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message" *ngIf="message">{{ message }}</p>
      <button 
        mat-flat-button 
        color="primary" 
        *ngIf="actionButton"
        (click)="actionClick.emit()">
        <mat-icon>{{ actionIcon }}</mat-icon>
        {{ actionButton }}
      </button>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as vars;
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }
    
    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(103, 58, 183, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      
      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: vars.$primary-color;
      }
    }
    
    .empty-title {
      font-size: 1.25rem;
      font-weight: 500;
      margin: 0 0 8px;
      color: vars.$text-primary;
    }
    
    .empty-message {
      color: vars.$text-secondary;
      margin: 0 0 24px;
      max-width: 400px;
    }
    
    button mat-icon {
      margin-right: 8px;
    }
  `],
  imports: [CommonModule, MatIconModule, MatButtonModule]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No data';
  @Input() message = '';
  @Input() actionButton = '';
  @Input() actionIcon = 'add';
  @Output() actionClick = new EventEmitter<void>();
}
src/app/shared/components/status-badge/status-badge.component.ts
typescript

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