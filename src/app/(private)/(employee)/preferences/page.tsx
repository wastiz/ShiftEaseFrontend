'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Calendar } from '@/components/ui/shadcn/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/shadcn/popover';
import { useGetShiftTypes, usePreferences, useSavePreferences } from '@/api';
import { toast } from 'sonner';
import Header from "@/modules/common/Header";
import Main from "@/modules/common/Main";
import { format } from 'date-fns';
import {useAuthStore} from "@/zustand/auth-state";

const WEEK_DAYS = [
    { id: 0, name: 'Sunday', short: 'Sun' },
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' },
];

export default function PreferencesPage() {
    const { user } = useAuthStore();
    const { data: preferences, isLoading } = usePreferences(user.id);
    const { data: shiftTypes } = useGetShiftTypes();
    const savePreferences = useSavePreferences(user.id);

    const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);
    const [selectedShiftTypes, setSelectedShiftTypes] = useState<number[]>([]);
    const [dayOffDates, setDayOffDates] = useState<Date[]>([]);

    useEffect(() => {
        if (preferences) {
            setSelectedWeekDays(preferences.weekDayPreferences || []);
            setSelectedShiftTypes(preferences.shiftTypePreferences || []);

            const dates = preferences.dayOffPreferences?.map(d => new Date(d)) || [];
            setDayOffDates(dates);
        }
    }, [preferences]);

    const toggleWeekDay = (dayId: number) => {
        setSelectedWeekDays(prev =>
            prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]
        );
    };

    const toggleShiftType = (shiftId: number) => {
        setSelectedShiftTypes(prev =>
            prev.includes(shiftId) ? prev.filter(id => id !== shiftId) : [...prev, shiftId]
        );
    };

    const removeDayOff = (date: Date) => {
        setDayOffDates(prev => prev.filter(d => d.toDateString() !== date.toDateString()));
    };

    const handleSave = async () => {
        const bundle = {
            shiftTypePreferences: selectedShiftTypes,
            weekDayPreferences: selectedWeekDays,
            dayOffPreferences: dayOffDates.map(d => format(d, 'yyyy-MM-dd')),
        };

        try {
            await savePreferences.mutateAsync(bundle);
            toast('Success', {
                description: 'Preferences saved successfully',
            });
        } catch (error) {
            toast.error("Error", {
                description: 'Could not save preferences',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Header title="Preferences">
                <Button onClick={handleSave} disabled={savePreferences.isPending}>
                    {savePreferences.isPending ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-5 w-5" />
                    )}
                    Save
                </Button>
            </Header>
            <Main>
                <div className="container max-w-4xl mx-auto p-4 pb-20 md:p-6">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preferred Weekdays</CardTitle>
                                <CardDescription>
                                    Select days you prefer to work
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {WEEK_DAYS.map((day) => (
                                        <div
                                            key={day.id}
                                            className={`
                                                flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all
                                                ${selectedWeekDays.includes(day.id)
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                            }
                                            `}
                                            onClick={() => toggleWeekDay(day.id)}
                                        >
                                            <span className="font-medium text-sm md:text-base">
                                                <span className="md:hidden">{day.short}</span>
                                                <span className="hidden md:inline">{day.name}</span>
                                            </span>
                                            {selectedWeekDays.includes(day.id) && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Preferred Shift Types</CardTitle>
                                <CardDescription>
                                    Select shift types you prefer to work
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {shiftTypes?.map((shiftType) => (
                                        <div
                                            key={shiftType.id}
                                            className={`
                                                flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all
                                                ${selectedShiftTypes.includes(shiftType.id)
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                            }
                                            `}
                                            onClick={() => toggleShiftType(shiftType.id)}
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{shiftType.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {shiftType.startTime} - {shiftType.endTime}
                                                </p>
                                            </div>
                                            {selectedShiftTypes.includes(shiftType.id) && (
                                                <Check className="h-5 w-5 text-primary ml-2" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Days Off Preferences</CardTitle>
                                <CardDescription>
                                    Select dates when you prefer not to work
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            Select dates
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="multiple"
                                            selected={dayOffDates}
                                            onSelect={(dates) => setDayOffDates(dates || [])}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                {dayOffDates.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Selected dates:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {dayOffDates.sort((a, b) => a.getTime() - b.getTime()).map((date, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-md text-sm"
                                                >
                                                    <span>{format(date, 'MMM dd, yyyy')}</span>
                                                    <button
                                                        onClick={() => removeDayOff(date)}
                                                        className="hover:text-destructive"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Main>
        </>
    );
}
