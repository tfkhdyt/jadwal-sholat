import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

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
  const { jadwal, date } = useLoaderData<typeof loader>();

  const timeLeft = (timeStr: string): string => {
    const today = new Date();
    const [hours, minutes] = timeStr.split(':');

    const timeObject = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      Number(hours),
      Number(minutes)
    );

    return formatDistanceToNow(timeObject, {
      includeSeconds: true,
      addSuffix: true,
      locale: id,
    });
  };

  return (
    <>
      <h2>{format(date, 'EEEE, d MMMM yyyy', { locale: id })}</h2>
      <Form method='PATCH'>
        <input type='hidden' name='_action' value='PREVIOUS_DAY' />
        <button type='submit'>Hari sebelumnya</button>
      </Form>
      <Form method='PATCH'>
        <input type='hidden' name='_action' value='TODAY' />
        <button type='submit'>Hari ini</button>
      </Form>
      <Form method='PATCH'>
        <input type='hidden' name='_action' value='NEXT_DAY' />
        <button type='submit'>Hari selanjutnya</button>
      </Form>
      <ul>
        <li>
          Imsak: {jadwal.jadwal.imsak} ({timeLeft(jadwal.jadwal.imsak)})
        </li>
        <li>
          Subuh: {jadwal.jadwal.subuh} ({timeLeft(jadwal.jadwal.subuh)})
        </li>
        <li>
          Terbit: {jadwal.jadwal.terbit} ({timeLeft(jadwal.jadwal.terbit)})
        </li>
        <li>
          Dhuha: {jadwal.jadwal.dhuha} ({timeLeft(jadwal.jadwal.dhuha)})
        </li>
        <li>
          Dzuhur: {jadwal.jadwal.dzuhur} ({timeLeft(jadwal.jadwal.dzuhur)})
        </li>
        <li>
          Ashar: {jadwal.jadwal.ashar} ({timeLeft(jadwal.jadwal.ashar)})
        </li>
        <li>
          Maghrib: {jadwal.jadwal.maghrib} ({timeLeft(jadwal.jadwal.maghrib)})
        </li>
        <li>
          Isya: {jadwal.jadwal.isya} ({timeLeft(jadwal.jadwal.isya)})
        </li>
      </ul>
    </>
  );
}
