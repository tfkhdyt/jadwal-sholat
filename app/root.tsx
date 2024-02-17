import { cssBundleHref } from '@remix-run/css-bundle';
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
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useParams,
} from '@remix-run/react';
import invariant from 'tiny-invariant';
import { commitSession, destroySession, getSession } from './sessions';

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
];

export const meta: MetaFunction = () => {
  return [
    { title: 'Jadwal Sholat' },
    { name: 'description', content: 'Jadwal Sholat' },
  ];
};

type Location = {
  id: string;
  lokasi: string;
};

type LocationResponse = {
  status: boolean;
  data: Location[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));

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
  const { locations, locationId } = useLoaderData<typeof loader>();
  const params = useParams();

  const getLocationName = (id: string) => {
    return (
      locations.find((location) => location.id === id)?.lokasi ??
      'Tidak diketahui'
    );
  };

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <div>
          <h1>Jadwal Sholat</h1>
          {locationId || params.locationId ? (
            <div>
              <p>
                Lokasi Anda saat ini:{' '}
                {params.locationId
                  ? getLocationName(params.locationId)
                  : getLocationName(locationId ?? '')}{' '}
              </p>
              <Form method='DELETE'>
                <input type='hidden' name='_action' value='RESET_LOCATION' />
                <button type='submit'>Ganti lokasi</button>
              </Form>
            </div>
          ) : (
            <div>
              <p>Pilih lokasi terlebih dahulu:</p>
              <Form method='POST'>
                <input type='hidden' name='_action' value='SET_LOCATION' />
                <select name='location' id='location' defaultValue=''>
                  <option value='' disabled>
                    Pilih lokasi
                  </option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.lokasi}
                    </option>
                  ))}
                </select>
                <button type='submit'>Set</button>
              </Form>
            </div>
          )}
          <div>
            <Outlet />
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
