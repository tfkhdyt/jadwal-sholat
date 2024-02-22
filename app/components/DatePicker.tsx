import { CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export const DatePicker = ({
  date,
  setDate,
}: {
  date?: Date;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [date]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className='bg-transparent border-2 border-lightBlue-800 hover:bg-lightBlue-800 group py-7 rounded-lg'
          title='Pilih tanggal'
        >
          <CalendarIcon
            className='text-lightBlue-800 group-hover:text-slate-100'
            size={32}
            strokeWidth={1.5}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
