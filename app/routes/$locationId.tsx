import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

const today = new Date();

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

  return (
    <>
      <h2>{dateFormatter.format(today)}</h2>
      <ul>
        <li>Imsak: {jadwal.jadwal.imsak}</li>
        <li>Subuh: {jadwal.jadwal.subuh}</li>
        <li>Terbit: {jadwal.jadwal.terbit}</li>
        <li>Dhuha: {jadwal.jadwal.dhuha}</li>
        <li>Dzuhur: {jadwal.jadwal.dzuhur}</li>
        <li>Ashar: {jadwal.jadwal.ashar}</li>
        <li>Maghrib: {jadwal.jadwal.maghrib}</li>
        <li>Isya: {jadwal.jadwal.isya}</li>
      </ul>
    </>
  );
}
