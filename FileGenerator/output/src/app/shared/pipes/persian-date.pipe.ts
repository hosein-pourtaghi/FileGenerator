
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