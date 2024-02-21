import { type ClassValue, clsx } from 'clsx';
import { isAfter } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { Jadwal } from '~/types/adzan';

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

export function getClosestAdzan(jadwalArray: Jadwal[]) {
  const waktuSekarang = new Date();
  const jamSekarang = waktuSekarang.getHours();
  const menitSekarang = waktuSekarang.getMinutes();
  const waktuSekarangDalamMenit = jamSekarang * 60 + menitSekarang;

  let jadwalTerdekat: Jadwal | null = null;
  let selisihTerdekat = Infinity;

  for (const jadwal of jadwalArray) {
    const [jamJadwal, menitJadwal] = jadwal.time.split(':');
    const waktuJadwalDalamMenit =
      parseInt(jamJadwal) * 60 + parseInt(menitJadwal);
    const selisih = waktuJadwalDalamMenit - waktuSekarangDalamMenit;

    if (selisih > 0 && selisih < selisihTerdekat) {
      selisihTerdekat = selisih;
      jadwalTerdekat = jadwal;
    }
  }

  return jadwalTerdekat;
}

export function timeRemaining(targetTime: string | null) {
  if (!targetTime) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  // Extract hours, minutes, and seconds from target time
  const [targetHours, targetMinutes] = targetTime.split(':');

  const targetDate = new Date();
  targetDate.setHours(Number(targetHours));
  targetDate.setMinutes(Number(targetMinutes));
  targetDate.setSeconds(0);

  // Get current time
  const now = new Date();

  // Calculate difference in milliseconds
  const elapsedMilliseconds = targetDate.getTime() - now.getTime();

  // Handle negative and zero time differences
  if (elapsedMilliseconds <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const hours = Math.floor(
    (elapsedMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (elapsedMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((elapsedMilliseconds / 1000) % 60);

  // Return object with remaining time
  return { hours, minutes, seconds };
}
