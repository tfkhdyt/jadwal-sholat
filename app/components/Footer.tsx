import { Link } from '@remix-run/react';

export const Footer = () => {
  return (
    <footer className='bg-lightBlue-800 inset-x-0 mt-14 py-8'>
      <div className='container mx-auto flex justify-between items-center text-white'>
        <span className='font-semibold text-sm'>
          &copy; {new Date().getFullYear()} Muslim
        </span>
        <div>
          <span className='font-semibold text-sm'>Created by</span>{' '}
          <Link
            to='https://tfkhdyt.my.id'
            target='_blank'
            rel='noreferrer'
            className='font-light hover:underline'
          >
            Taufik Hidayat
          </Link>
        </div>
      </div>
    </footer>
  );
};
