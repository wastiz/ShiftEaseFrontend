'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/ui/shadcn/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/ui/shadcn/popover';
import Flag from 'react-world-flags';

const regions = [
    { value: '+372', label: '+372 Estonia', countryCode: 'ee' },
    { value: '+375', label: '+375 Belarus', countryCode: 'by' },
    { value: '+380', label: '+380 Ukraine', countryCode: 'ua' },
    { value: '+44', label: '+44 United Kingdom', countryCode: 'gb' },
    { value: '+57', label: '+57 Colombia', countryCode: 'co' },
];
const pholder = (
    <>
        <Flag code="ee" className="w-7 h-6 me-1" />
        +372
    </>
);

export function ComboBox({ onChange }: { onChange?: (value: string) => void }) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState('+372');

    React.useEffect(() => {
        if (value && onChange) {
            onChange(value);
        }
    }, [value, onChange]);

    const handleSelect = (currentValue: string) => {
        const newValue = currentValue === value ? '' : currentValue;
        setValue(newValue);
        setOpen(false);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    role="combobox"
                    className={cn(
                        'absolute z-10 inset-y-0 left-0 px-4 min-w-[10%] justify-center bg-muted/10 text-xl hover:bg-muted/25 cursor-pointer font-bold rounded-l-md transition duration-200 inline-flex items-center gap-1 border-r-1 border-current/30',
                        open && 'bg-muted/25'
                    )}
                >
                    {regions.find((r) => r.value === value) && (
                        <Flag
                            code={regions
                                .find((r) => r.value === value)!
                                .countryCode.toUpperCase()}
                            className="w-7 h-6 me-1"
                        />
                    )}
                    {regions.find((r) => r.value === value)?.value ?? pholder}
                    <ChevronDown className="ml-1 stroke-4 h-5 w-5" />
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Search region..."
                        className="h-9"
                    />
                    <CommandList>
                        <CommandEmpty>No region found.</CommandEmpty>
                        <CommandGroup>
                            {regions.map((region) => (
                                <CommandItem
                                    key={region.value}
                                    value={region.value}
                                    onSelect={handleSelect}
                                >
                                    <Flag
                                        code={region.countryCode.toUpperCase()}
                                        style={{
                                            width: 20,
                                            height: 15,
                                            marginRight: 8,
                                        }}
                                    />
                                    {region.label}
                                    <Check
                                        className={cn(
                                            'ml-auto',
                                            value === region.value
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
