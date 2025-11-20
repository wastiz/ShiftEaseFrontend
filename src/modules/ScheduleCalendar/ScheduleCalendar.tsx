'use client'

import { Button } from '@/components/ui/shadcn/button'
import { Badge } from '@/components/ui/shadcn/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import DayContainer from './DayContainer'
import ShiftTypeCard from '@/components/cards/ShiftTypeCard'
import EmployeeCard from '@/components/cards/EmployeeCard'
import {DateData, EmployeeMinData, Holiday, Shift, ShiftType, WorkDay} from '@/types'
import { Dispatch, SetStateAction } from 'react'

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
    autorenewal: boolean
    setAutorenewal: Dispatch<SetStateAction<boolean>>
    isConfirmed: boolean
    isEditable?: boolean
    cellHeight?: number
    orgHolidays?: Holiday[]
    orgSchedule?: WorkDay[]
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
                                             autorenewal,
                                             setAutorenewal,
                                             isConfirmed,
                                             isEditable = true,
                                             cellHeight = 40,
                                             orgHolidays,
                                             orgSchedule,
                                         }: ScheduleCalendarProps) {
    return (
        <div className="flex h-[calc(100vh-120px)] gap-4">
            {isEditable && (
                <aside className="w-64 flex-shrink-0 space-y-6 border-r p-4 overflow-y-auto">
                    <div>
                        <h4 className="font-semibold mb-2">Shift Types</h4>
                        <div className="space-y-2">
                            {shiftTypes.map((st) => (
                                <ShiftTypeCard
                                    key={st.id}
                                    type={st.name}
                                    id={st.id}
                                    startTime={st.startTime}
                                    endTime={st.endTime}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Employees</h4>
                        <div className="space-y-2">
                            {employees.map((emp) => (
                                <EmployeeCard key={emp.id} id={emp.id} name={emp.name}/>
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
                                ? (setCurrentMonth(11), setCurrentYear((y) => y - 1))
                                : setCurrentMonth((m) => m - 1)
                        }
                    >
                        <ChevronLeft/>
                    </Button>

                    <span className="font-medium whitespace-nowrap">
                        {new Date(currentYear, currentMonth).toLocaleString('default', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            currentMonth === 11
                                ? (setCurrentMonth(0), setCurrentYear((y) => y + 1))
                                : setCurrentMonth((m) => m + 1)
                        }
                    >
                        <ChevronRight/>
                    </Button>

                    <label className="flex items-center gap-2 ml-4 whitespace-nowrap">
                        <input
                            type="checkbox"
                            checked={autorenewal}
                            onChange={(e) => setAutorenewal(e.target.checked)}
                        />
                        Autorenewal
                    </label>

                    {isConfirmed ? (
                        <Badge variant="secondary" className="ml-2">
                            Confirmed
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="ml-2">
                            Unconfirmed
                        </Badge>
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
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
