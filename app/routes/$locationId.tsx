import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { format } from 'date-fns';
import { z } from 'zod';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DatePicker } from '~/components/DatePicker';
import { Button } from '~/components/ui/button';
import { useClosestAdzan } from '~/hooks/use-closest-adzan';
import { cn, isPassed, toCapitalize } from '~/lib/utils';

type JadwalResponse = {
  status: boolean;
  data: {
    id: number;
    lokasi: string;
    daerah: string;
    jadwal: {
      tanggal: string;
      imsak: string;
      subuh: string;
      terbit: string;
      dhuha: string;
      dzuhur: string;
      ashar: string;
      maghrib: string;
      isya: string;
      date: string;
    };
  };
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const dateFromSearchParams = searchParams.get('date');

  const today = dateFromSearchParams
    ? new Date(dateFromSearchParams)
    : new Date();

  const res = await fetch(
    `https://api.myquran.com/v2/sholat/jadwal/${
      params.locationId
    }/${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  );
  const data: JadwalResponse = await res.json();
  if (!res.ok || !data.status) {
    throw json({ error: 'Gagal untuk mengambil data jadwal sholat' });
  }

  return json({ jadwal: data.data, date: today });
};

const actionSchema = z.object({
  _action: z.enum(['NEXT_DAY', 'PREVIOUS_DAY', 'TODAY', 'SET_DATE']),
  date: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
});

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const dateFromSearchParams = searchParams.get('date');

  const today = dateFromSearchParams
    ? new Date(dateFromSearchParams)
    : new Date();

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const result = actionSchema.safeParse(data);
  if (!result.success) {
    throw json({ message: result.error.message }, { status: 422 });
  }

  switch (result.data._action) {
    case 'NEXT_DAY':
      return redirect(
        `/${params.locationId}?date=${format(
          today.setDate(today.getDate() + 1),
          'yyyy-MM-dd'
        )}`
      );
    case 'PREVIOUS_DAY':
      return redirect(
        `/${params.locationId}?date=${format(
          today.setDate(today.getDate() - 1),
          'yyyy-MM-dd'
        )}`
      );
    case 'TODAY':
      return redirect(`/${params.locationId}`);
    case 'SET_DATE':
      return redirect(
        `/${params.locationId}?date=${format(
          result.data.date ?? '',
          'yyyy-MM-dd'
        )}`
      );
    default:
      return null;
  }
};

export default function Location() {
  const { jadwal, date } = useLoaderData<typeof loader>();
  const jadwalArray = useMemo(
    () => [
      { name: 'Subuh', time: jadwal.jadwal.subuh },
      { name: 'Dhuha', time: jadwal.jadwal.dhuha },
      { name: 'Dzuhur', time: jadwal.jadwal.dzuhur },
      { name: 'Ashar', time: jadwal.jadwal.ashar },
      { name: 'Maghrib', time: jadwal.jadwal.maghrib },
      { name: 'Isya', time: jadwal.jadwal.isya },
      { name: 'Subuh', time: jadwal.jadwal.subuh },
    ],
    [jadwal]
  );
  const { closestUpcomingAdzan, timeRemainingToClosestAdzan: timeLeft } =
    useClosestAdzan(jadwalArray);
  const submit = useSubmit();
  const [currentDate, setCurrentDate] = useState<Date | undefined>();

  useEffect(() => {
    if (currentDate) {
      submit(
        { _action: 'SET_DATE', date: currentDate.toString() },
        { method: 'PATCH', preventScrollReset: true }
      );
    }
  }, [currentDate, submit]);

  return (
    <div className='space-y-6'>
      <h2 className='font-semibold text-xl md:text-2xl'>
        Jadwal Sholat {toCapitalize(jadwal.lokasi)}, GMT +7
      </h2>
      <div className='bg-white rounded-2xl md:py-5 shadow-md grid grid-flow-row md:grid-flow-col justify-stretch items-center divide-y-2 md:divide-y-0 md:divide-x-2'>
        {jadwalArray.map((time, idx) => {
          if (idx < 6)
            return (
              <div
                className='flex justify-between items-center p-5 md:flex-col space-y-1 text-center'
                key={time.name}
              >
                <p
                  className={cn(
                    isPassed(time.time)
                      ? 'text-lg md:text-xl text-coolGray-800'
                      : 'text-lg md:text-xl text-lightBlue-800 font-bold'
                  )}
                >
                  {time.name}
                </p>
                <p
                  className={cn(
                    isPassed(time.time)
                      ? 'text-lg md:text-xl text-gray-400'
                      : 'text-lg md:text-xl text-coolGray-800'
                  )}
                >
                  {time.time} WIB
                </p>
              </div>
            );
        })}
      </div>
      <div className='pt-4 flex flex-col md:flex-row gap-2 justify-between'>
        <h2 className='font-semibold text-xl md:text-2xl'>
          Waktu Sholat Selanjutnya:
        </h2>
        <div className='text-lg md:text-xl'>
          <span className='font-semibold'>{closestUpcomingAdzan?.name},</span>{' '}
          <span>
            {timeLeft?.hours !== 0 && `${timeLeft.hours} Jam :`}{' '}
            {timeLeft?.minutes !== 0 && `${timeLeft.minutes} Menit :`}{' '}
            {timeLeft?.seconds} Detik
          </span>
        </div>
      </div>
      <div>
        <div className='flex justify-between items-center'>
          <div className='space-x-4'>
            <DatePicker date={currentDate} setDate={setCurrentDate} />
          </div>
          <div className='space-x-4'>
            <Button
              className='bg-transparent border-2 border-lightBlue-800 hover:bg-lightBlue-800 group py-7 rounded-lg'
              onClick={() =>
                submit(
                  { _action: 'PREVIOUS_DAY' },
                  { method: 'PATCH', preventScrollReset: true }
                )
              }
              title='Hari sebelumnya'
            >
              <ChevronLeftIcon
                className='text-lightBlue-800 group-hover:text-slate-100'
                size={32}
                strokeWidth={1.5}
              />
            </Button>
            {new Date().getDate() !== new Date(date).getDate() && (
              <Button
                className='bg-transparent border-2 border-lightBlue-800 hover:bg-lightBlue-800 group py-7 rounded-lg'
                onClick={() =>
                  submit(
                    { _action: 'TODAY' },
                    { method: 'PATCH', preventScrollReset: true }
                  )
                }
                title='Hari ini'
              >
                <MoreHorizontalIcon
                  className='text-lightBlue-800 group-hover:text-slate-100'
                  size={32}
                  strokeWidth={1.5}
                />
              </Button>
            )}
            <Button
              className='bg-transparent border-2 border-lightBlue-800 hover:bg-lightBlue-800 group py-7 rounded-lg'
              onClick={() =>
                submit(
                  { _action: 'NEXT_DAY' },
                  { method: 'PATCH', preventScrollReset: true }
                )
              }
              title='Hari selanjutnya'
            >
              <ChevronRightIcon
                className='text-lightBlue-800 group-hover:text-slate-100'
                size={32}
                strokeWidth={1.5}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
