import {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from '@remix-run/node';
import {
  Form,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useParams,
} from '@remix-run/react';
import invariant from 'tiny-invariant';
import stylesheet from '~/tailwind.css?url';
import { commitSession, destroySession, getSession } from './sessions';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toHijriDate } from './lib/hijri';
import { LocationResponse } from './types/location';
import { CityCombobox } from './components/CityCombobox';
import { useState } from 'react';
import { Button } from './components/ui/button';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
];

export const meta: MetaFunction = () => {
  return [
    { title: 'Jadwal Sholat' },
    { name: 'description', content: 'Jadwal Sholat' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));
  const { searchParams } = new URL(request.url);
  const dateFromSearchParams = searchParams.get('date');

  const today = dateFromSearchParams
    ? new Date(dateFromSearchParams)
    : new Date();

  const res = await fetch('https://api.myquran.com/v2/sholat/kota/semua');
  const data: LocationResponse = await res.json();
  if (!res.ok || !data.status) {
    throw json({ error: 'failed to fetch all location' }, { status: 500 });
  }
  invariant(data.data, 'location data is empty');

  const sortedLocations = data.data.sort((a, b) =>
    a.lokasi.localeCompare(b.lokasi)
  );

  return json({
    locations: sortedLocations,
    locationId: session.get('locationId'),
    date: today,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));

  const formData = await request.formData();
  const data = Object.fromEntries(formData) as {
    location: string;
    _action: 'SET_LOCATION' | 'RESET_LOCATION';
  };
  switch (data._action) {
    case 'SET_LOCATION':
      invariant(data.location, 'Lokasi tidak valid');
      session.set('locationId', data.location);
      return redirect(`/${data.location}`, {
        headers: {
          'Set-Cookie': await commitSession(session, {
            expires: new Date('2077-01-01'),
          }),
        },
      });
    case 'RESET_LOCATION':
      session.set('locationId', null);
      return redirect('/', {
        headers: {
          'Set-Cookie': await destroySession(session),
        },
      });
    default:
      return null;
  }
};

export default function App() {
  const { locations, locationId, date } = useLoaderData<typeof loader>();
  const params = useParams();
  const [city, setCity] = useState(locationId ?? params.locationId);

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body className='bg-slate-100'>
        <div className='relative -z-50'>
          <img
            src='/images/header.png'
            alt='Header'
            className='w-screen h-auto aspect-[7/1] object-cover z-0 object-bottom'
          />
          <header className='absolute top-0 inset-x-0 container mx-auto py-5'>
            <span className='text-xl text-white'>Jadwal Sholat</span>
          </header>
        </div>
        <div className='container mx-auto -mt-16'>
          <div className='bg-white rounded-2xl py-7 px-8 flex justify-between'>
            <div className='space-y-4'>
              <h2 className='font-semibold text-2xl'>Cari Lokasi Anda</h2>
              <Form method='POST'>
                <input type='hidden' name='_action' value='SET_LOCATION' />
                <input
                  type='hidden'
                  name='location'
                  value={city ?? undefined}
                />
                <div className='flex space-x-2'>
                  <CityCombobox
                    value={city ?? ''}
                    setValue={setCity}
                    locations={locations}
                  />
                  <Button
                    type='submit'
                    className='bg-cyan-800 hover:bg-cyan-700 font-medium'
                  >
                    Pilih
                  </Button>
                </div>
              </Form>
            </div>
            <div className='text-right'>
              <p className='text-xl'>
                {format(date, 'dd MMMM yyyy', { locale: id })}
              </p>
              <p className='text-xl'>{toHijriDate(new Date(date))}</p>
              <p className='font-semibold text-2xl'>
                {format(date, 'EEEE', { locale: id })}
              </p>
            </div>
          </div>
        </div>
        <div className='container mx-auto mt-16'>
          {locationId || params.locationId ? (
            <Outlet />
          ) : (
            <h2 className='font-semibold text-2xl text-center'>
              Pilih Kota/Kab terlebih dahulu
            </h2>
          )}
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
