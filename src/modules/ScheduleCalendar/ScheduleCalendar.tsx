'use client'

import { Button } from '@/components/ui/shadcn/button'
import { Badge } from '@/components/ui/shadcn/badge'
import { ChevronLeft, ChevronRight, PanelLeft, PanelTop, Filter } from 'lucide-react'
import DayContainer from './DayContainer'
import ShiftTypeSmallCard from '@/components/cards/ShiftTypeSmallCard'
import EmployeeSmallCard from '@/components/cards/EmployeeSmallCard'
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
            {isEditable && (
                <div
                    className={`border-b space-y-3 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
                        layoutPosition === 'top' ? 'max-h-[200px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0'
                    }`}
                >
                    <div className="flex gap-4 overflow-x-auto">
                        <div className="flex-shrink-0">
                            <h4 className="font-semibold mb-2">Shift Types</h4>
                            <div className="flex gap-2">
                                {shiftTypes.map((st) => (
                                    <ShiftTypeSmallCard
                                        key={st.id}
                                        name={st.name}
                                        id={st.id}
                                        startTime={st.startTime}
                                        endTime={st.endTime}
                                        color={st.color}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto">
                        <div className="flex-shrink-0">
                            <h4 className="font-semibold mb-2">Employees</h4>
                            <div className="flex gap-2">
                                {filteredEmployees.map((emp) => (
                                    <EmployeeSmallCard key={emp.id} id={emp.id} name={emp.name} position={emp.position}/>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-1 gap-4 min-h-0">
                {isEditable && (
                    <aside
                        className={`flex-shrink-0 space-y-6 border-r overflow-y-auto transition-all duration-300 ease-in-out ${
                            layoutPosition === 'left' ? 'w-64 opacity-100 p-4' : 'w-0 opacity-0 p-0 border-0'
                        }`}
                    >
                        <div>
                            <h4 className="font-semibold mb-2">Shift Types</h4>
                            <div className="space-y-2">
                                {shiftTypes.map((st) => (
                                    <ShiftTypeSmallCard
                                        key={st.id}
                                        name={st.name}
                                        id={st.id}
                                        startTime={st.startTime}
                                        endTime={st.endTime}
                                        color={st.color}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Employees</h4>
                            <div className="space-y-2">
                                {filteredEmployees.map((emp) => (
                                    <EmployeeSmallCard key={emp.id} id={emp.id} name={emp.name} position={emp.position}/>
                                ))}
                            </div>
                        </div>
                    </aside>
                )}

                <section className="flex-1 flex flex-col min-w-0 p-4 space-y-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                currentMonth === 0
                                    ? (setCurrentMonth(11), setCurrentYear(currentYear - 1))
                                    : setCurrentMonth(currentMonth - 1)
                            }
                        >
                            <ChevronLeft />
                        </Button>

                        <div className="flex items-center gap-2">
                            <span className="font-medium whitespace-nowrap">
                                {new Date(currentYear, currentMonth).toLocaleString('default', {
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </span>
                            {isConfirmed ? (
                                <Badge variant="secondary">
                                    Confirmed
                                </Badge>
                            ) : (
                                <Badge variant="outline">
                                    Unconfirmed
                                </Badge>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                currentMonth === 11
                                    ? (setCurrentMonth(0), setCurrentYear(currentYear + 1))
                                    : setCurrentMonth(currentMonth + 1)
                            }
                        >
                            <ChevronRight />
                        </Button>

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
                    </div>

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
            </div>
        </div>
    )
}
