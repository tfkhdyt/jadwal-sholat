import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Location } from '~/types/location';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/command';
import { cn } from '~/lib/utils';

export function CityCombobox({
  value,
  setValue,
  locations,
}: {
  value: string;
  setValue: (str: string) => void;
  locations: Location[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[400px] justify-between'
        >
          {value
            ? locations.find((location) => location.id === value)?.lokasi ??
              'Pilih Kab/Kota...'
            : 'Pilih Kab/Kota...'}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[400px] p-0'>
        <Command>
          <CommandInput placeholder='Search Kab/Kota...' />
          <CommandEmpty>Kab/Kota tidak ditemukan</CommandEmpty>
          <CommandGroup className='max-h-[200px] overflow-y-auto'>
            {locations.map((location) => (
              <CommandItem
                key={location.id}
                value={`${location.id}|${location.lokasi}`}
                onSelect={(currentValue) => {
                  setValue(
                    locations.find(
                      (location) =>
                        location.lokasi ===
                        currentValue.split('|')[1].toUpperCase()
                    )?.id ?? ''
                  );
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === location.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {location.lokasi}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
