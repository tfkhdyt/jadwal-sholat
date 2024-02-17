import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
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

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const today = new Date();
  const res = await fetch(
    `https://api.myquran.com/v2/sholat/jadwal/${
      params.locationId
    }/${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  );
  const data: JadwalResponse = await res.json();
  if (!res.ok || !data.status) {
    throw json({ error: 'Gagal untuk mengambil data jadwal sholat' });
  }

  return json({ jadwal: data.data });
};

export default function Location() {
  const { jadwal } = useLoaderData<typeof loader>();

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
      <h2>{format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}</h2>
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
