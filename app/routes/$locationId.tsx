import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { format } from 'date-fns';
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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const dateFromSearchParams = searchParams.get('date');

  const today = dateFromSearchParams
    ? new Date(dateFromSearchParams)
    : new Date();

  const formData = await request.formData();
  const data = Object.fromEntries(formData) as {
    _action: 'NEXT_DAY' | 'PREVIOUS_DAY' | 'TODAY';
  };

  switch (data._action) {
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
    default:
      return null;
  }
};

export default function Location() {
  const { jadwal } = useLoaderData<typeof loader>();
  const jadwalArray = [
    { name: 'Imsak', time: jadwal.jadwal.imsak },
    { name: 'Subuh', time: jadwal.jadwal.subuh },
    { name: 'Dzuhur', time: jadwal.jadwal.dzuhur },
    { name: 'Ashar', time: jadwal.jadwal.ashar },
    { name: 'Maghrib', time: jadwal.jadwal.maghrib },
    { name: 'Isya', time: jadwal.jadwal.isya },
  ];

  return (
    <div className='space-y-6'>
      <h2 className='font-semibold text-2xl'>
        Jadwal Sholat {toCapitalize(jadwal.lokasi)}, GMT +7
      </h2>
      {/* <Form method='PATCH'> */}
      {/*   <input type='hidden' name='_action' value='PREVIOUS_DAY' /> */}
      {/*   <button type='submit'>Hari sebelumnya</button> */}
      {/* </Form> */}
      {/* <Form method='PATCH'> */}
      {/*   <input type='hidden' name='_action' value='TODAY' /> */}
      {/*   <button type='submit'>Hari ini</button> */}
      {/* </Form> */}
      {/* <Form method='PATCH'> */}
      {/*   <input type='hidden' name='_action' value='NEXT_DAY' /> */}
      {/*   <button type='submit'>Hari selanjutnya</button> */}
      {/* </Form> */}
      <div className='bg-white rounded-2xl p-7 shadow-md grid grid-flow-col justify-stretch items-center divide-x-2'>
        {jadwalArray.map((time) => (
          <div
            className='py-6 px-8 flex-col space-y-2 text-center'
            key={time.name}
          >
            <p
              className={cn(
                isPassed(time.time)
                  ? 'text-xl text-gray-900'
                  : 'text-xl text-cyan-800 font-bold'
              )}
            >
              {time.name}
            </p>
            <p
              className={cn(
                isPassed(time.time)
                  ? 'text-xl text-zinc-500'
                  : 'text-xl text-gray-900'
              )}
            >
              {time.time} WIB
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
