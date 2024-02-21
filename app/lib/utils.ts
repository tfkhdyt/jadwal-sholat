import { type ClassValue, clsx } from 'clsx';
import { isAfter } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toCapitalize(str: string) {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function isPassed(date: string) {
  const prayerTime = new Date();
  prayerTime.setHours(Number(date.split(':')[0]));
  prayerTime.setMinutes(Number(date.split(':')[1]));

  return isAfter(new Date(), prayerTime);
}
