import { Link } from '@remix-run/react';

export const Footer = () => {
  return (
    <footer className='bg-lightBlue-800 inset-x-0 md:mt-14 py-8'>
      <div className='container mx-auto flex justify-between items-center text-white'>
        <span className='font-semibold text-sm'>
          &copy; {new Date().getFullYear()} Muslim
        </span>
        <div>
          <span className='font-semibold text-sm'>Created by</span>{' '}
          <span className='font-light text-sm'>
            <Link
              to='https://tfkhdyt.my.id'
              target='_blank'
              rel='noreferrer'
              className='hover:underline'
              title='Taufik Hidayat'
            >
              tfkhdyt
            </Link>
            {' & '}
            <Link
              to='https://www.instagram.com/gmajido/'
              target='_blank'
              rel='noreferrer'
              className='hover:underline'
              title='Galang Nur Majid'
            >
              gmajido
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
};
