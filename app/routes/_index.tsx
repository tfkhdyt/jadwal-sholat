import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { getSession } from '~/sessions';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));
  if (session.has('locationId')) {
    return redirect(`/${session.get('locationId')}`);
  }

  return null;
};

export default function Index() {
  return <div></div>;
}
