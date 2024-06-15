import { useState, useEffect } from 'react';
import { getClosestAdzan, timeRemaining } from '~/lib/utils';
import { Jadwal } from '~/types/adzan';

export function useClosestAdzan(jadwal: Jadwal[]) {
  const [closestUpcomingAdzan, setClosestUpcomingAdzan] = useState<Jadwal | null>(getClosestAdzan(jadwal));
  const [timeRemainingToClosestAdzan, setTimeRemainingToClosestAdzan] = useState(
    timeRemaining(closestUpcomingAdzan?.time ?? null)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const closestAdzan = getClosestAdzan(jadwal);
      const timeToAdzan = timeRemaining(closestUpcomingAdzan?.time ?? null, jadwal[0].time);

      setTimeRemainingToClosestAdzan(timeToAdzan);
      if (closestAdzan) {
        setClosestUpcomingAdzan(closestAdzan);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [jadwal, closestUpcomingAdzan]);

  return { closestUpcomingAdzan, timeRemainingToClosestAdzan };
}
