'use client'

import { Button } from '@/components/ui/shadcn/button'
import { PanelLeft, PanelTop, Filter } from 'lucide-react'
import DayContainer from './DayContainer'
import {DateData, EmployeeMinData, Holiday, Shift, ShiftType, WorkDay} from '@/types'
import { EmployeeTimeOff } from '@/types/schedule'
import { Dispatch, SetStateAction, useState, useMemo } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/shadcn/popover'
import { Checkbox } from '@/components/ui/shadcn/checkbox'
import { Label } from '@/components/ui/shadcn/label'
import {WarningMessage} from "@/app/(private)/(employer)/schedules/[groupId]/page";
import {MonthNavigator} from "@/components/features/schedules/MonthNavigator";
import {MessageIndicator} from "@/components/features/schedules/MessageIndicator";
import ScheduleData from "@/components/features/schedules/ScheduleData";

type ScheduleCalendarProps = {
    shiftsData: Shift[]
    setShiftsData?: Dispatch<SetStateAction<Shift[]>>
    shiftTypes: ShiftType[]
    employees: EmployeeMinData[]
    daysOfMonth: DateData[]
    currentMonth: number
    currentYear: number
    setCurrentMonth: Dispatch<SetStateAction<number>>
    setCurrentYear: Dispatch<SetStateAction<number>>
    isConfirmed: boolean
    isEditable?: boolean
    cellHeight?: number
    orgHolidays?: Holiday[]
    orgSchedule?: WorkDay[]
    employeeTimeOffs?: EmployeeTimeOff[]
    warningMessage: WarningMessage | null
}

export default function ScheduleCalendar({
                                             shiftsData,
                                             setShiftsData,
                                             shiftTypes,
                                             employees,
                                             daysOfMonth,
                                             currentMonth,
                                             currentYear,
                                             setCurrentMonth,
                                             setCurrentYear,
                                             isConfirmed,
                                             isEditable = true,
                                             cellHeight = 40,
                                             orgHolidays,
                                             orgSchedule,
                                             employeeTimeOffs = [],
                                             warningMessage,
                                         }: ScheduleCalendarProps) {

    const [layoutPosition, setLayoutPosition] = useState<'left' | 'top'>('left')
    const [selectedShiftTypes, setSelectedShiftTypes] = useState<number[]>([])

    const filteredEmployees = useMemo(() => {
        if (selectedShiftTypes.length === 0) return employees;

        const employeeIdsWithSelectedShifts = new Set<number>();
        shiftsData.forEach(shift => {
            if (selectedShiftTypes.includes(shift.shiftTypeId)) {
                shift.employees.forEach(emp => employeeIdsWithSelectedShifts.add(emp.id));
            }
        });

        return employees.filter(emp => employeeIdsWithSelectedShifts.has(emp.id));
    }, [employees, selectedShiftTypes, shiftsData]);

    const handleShiftTypeFilterToggle = (shiftTypeId: number) => {
        setSelectedShiftTypes(prev =>
            prev.includes(shiftTypeId)
                ? prev.filter(id => id !== shiftTypeId)
                : [...prev, shiftTypeId]
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-62px)]">

            <div className="flex items-center gap-3 flex-shrink-0 m-4">
                <MonthNavigator
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    isConfirmed={isConfirmed}
                    onChange={(month, year) => {
                        setCurrentMonth(month);
                        setCurrentYear(year);
                    }}
                />

                {isEditable && (
                    <>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" className="ml-auto">
                                    <Filter className={selectedShiftTypes.length > 0 ? "text-primary" : ""} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm">Filter by Shift Types</h4>
                                    <div className="space-y-2">
                                        {shiftTypes.map((st) => (
                                            <div key={st.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`filter-${st.id}`}
                                                    checked={selectedShiftTypes.includes(st.id)}
                                                    onCheckedChange={() => handleShiftTypeFilterToggle(st.id)}
                                                />
                                                <Label
                                                    htmlFor={`filter-${st.id}`}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <div
                                                        className="w-3 h-3 rounded"
                                                        style={{ backgroundColor: st.color }}
                                                    />
                                                    {st.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedShiftTypes.length > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedShiftTypes([])}
                                            className="w-full"
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setLayoutPosition(layoutPosition === 'left' ? 'top' : 'left')}
                        >
                            {layoutPosition === 'left' ? <PanelTop /> : <PanelLeft />}
                        </Button>
                    </>
                )}

                {warningMessage && (
                    <MessageIndicator
                        message={warningMessage.message}
                        messageType="warning"
                    />
                )}

            </div>

            <ScheduleData
                isEditable={isEditable}
                layoutPosition={layoutPosition}
                shiftTypes={shiftTypes}
                filteredEmployees={filteredEmployees}
            >
                <section className="flex-1 flex flex-col min-w-0 space-y-4">
                    <div className="flex-1 border rounded-lg overflow-auto">
                        <div
                            className="grid min-w-max"
                            style={{
                                gridTemplateColumns: `100px repeat(${daysOfMonth.length}, 180px)`,
                            }}
                        >
                            <div className="sticky left-0 z-10 shadow-md bg-background">
                                <div
                                    className="h-10 flex items-center justify-center font-medium border-b border-r bg-black"></div>
                                {Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`).map((h) => (
                                    <div
                                        key={h}
                                        className="h-10 bg-black border-b border-r flex items-center justify-center text-sm"
                                    >
                                        {h}
                                    </div>
                                ))}
                            </div>

                            {daysOfMonth.map((day) => (
                                <DayContainer
                                    key={day.isoDate}
                                    date={day.isoDate}
                                    dateLabel={day.label}
                                    shiftTypes={shiftTypes}
                                    employees={employees}
                                    shiftsData={shiftsData}
                                    setShiftsData={setShiftsData}
                                    isEditable={isEditable}
                                    cellHeight={cellHeight}
                                    holidays={orgHolidays}
                                    workDays={orgSchedule}
                                    employeeTimeOffs={employeeTimeOffs}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </ScheduleData>
        </div>
    )
}
