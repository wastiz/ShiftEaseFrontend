'use client'
import { useEffect, useRef, useState } from 'react'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { toast } from 'sonner'
import ShiftBox from './ShiftBox'
import {Holiday, WorkDay, Shift, ShiftType, EmployeeMinData} from "@/types";
import { EmployeeTimeOff, TimeOffType } from "@/types/schedule";

const CELL_HEIGHT = 40
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

type DayContainerProps = {
    date: string
    dateLabel: string
    shiftTypes: ShiftType[]
    employees: EmployeeMinData[]
    shiftsData: Shift[]
    setShiftsData?: (shifts: Shift[] | ((prev: Shift[]) => Shift[])) => void
    isEditable?: boolean
    cellHeight?: number
    holidays?: Holiday[]
    workDays?: WorkDay[]
    employeeTimeOffs?: EmployeeTimeOff[]
}

function isHoliday(date: string, holidays: Holiday[]) {
    const d = new Date(date)
    return holidays.some(h => h.month === d.getUTCMonth() + 1 && h.day === d.getUTCDate())
}

function isWorkingDay(date: string, workDays: WorkDay[]) {
    const d = new Date(date)
    const dayOfWeek = d.getUTCDay()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const currentDayName = dayNames[dayOfWeek]

    return workDays.some(wd => wd.dayOfWeek === currentDayName)
}

function getPreviousDay(dateStr: string): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
}

function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function getEmployeeTimeOffsForDate(date: string, timeOffs: EmployeeTimeOff[]): EmployeeTimeOff[] {
    const dateObj = new Date(date)
    return timeOffs.filter(timeOff => {
        const startDate = new Date(timeOff.startDate)
        const endDate = new Date(timeOff.endDate)
        return dateObj >= startDate && dateObj <= endDate
    })
}

function getTimeOffTypeLabel(type: TimeOffType): string {
    switch (type) {
        case TimeOffType.Vacation:
            return 'V'
        case TimeOffType.SickLeave:
            return 'S'
        case TimeOffType.PersonalDay:
            return 'P'
        default:
            return 'T'
    }
}

function getTimeOffTypeColor(type: TimeOffType): string {
    switch (type) {
        case TimeOffType.Vacation:
            return 'bg-blue-500'
        case TimeOffType.SickLeave:
            return 'bg-orange-500'
        case TimeOffType.PersonalDay:
            return 'bg-purple-500'
        default:
            return 'bg-gray-500'
    }
}

export default function DayContainer({
                                         date,
                                         dateLabel,
                                         shiftTypes,
                                         employees,
                                         shiftsData,
                                         setShiftsData,
                                         isEditable = true,
                                         cellHeight = 40,
                                         holidays = [],
                                         workDays = [],
                                         employeeTimeOffs = []
                                     }: DayContainerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [isDraggingOver, setIsDraggingOver] = useState(false)

    const shiftsInDay = shiftsData.filter((s) => s.date === date)

    const previousDay = getPreviousDay(date);
    const previousDayShifts = shiftsData.filter((s) => {
        if (s.date !== previousDay) return false;
        const startMinutes = timeToMinutes(s.startTime);
        const endMinutes = timeToMinutes(s.endTime);
        return endMinutes <= startMinutes;
    });

    const holiday = isHoliday(date, holidays)
    const working = isWorkingDay(date, workDays)
    const isNonWorkingDay = holiday || !working

    useEffect(() => {
        if (!isEditable) return
        if (!ref.current) return
        return dropTargetForElements({
            element: ref.current,
            onDrop: ({ source }) => {
                if (source.data.type === 'shiftType') {
                    const st = shiftTypes.find((x) => x.id === source.data.id)
                    if (!st) return

                    if (shiftsInDay.some((s) => s.shiftTypeId === st.id)) {
                        toast.error('This shift type already exists on this day')
                        return
                    }

                    if (setShiftsData) {
                        setShiftsData((prev) => [
                            ...prev,
                            {
                                id: Date.now(),
                                shiftTypeName: st.name,
                                shiftTypeId: st.id,
                                startTime: st.startTime,
                                endTime: st.endTime,
                                date,
                                color: st.color,
                                employeeNeeded: 1,
                                employees: [],
                            },
                        ])
                    }
                    setIsDraggingOver(false)
                }

                if (source.data.type === 'shift') {
                    const shiftId = source.data.id
                    const shift = shiftsData.find((s) => s.id === shiftId)
                    if (!shift) return

                    if (shift.date === date) {
                        toast.info('Shift is already on this day')
                        return
                    }

                    if (shiftsInDay.some((s) => s.shiftTypeId === shift.shiftTypeId)) {
                        toast.error('This shift type already exists on this day')
                        return
                    }

                    if (setShiftsData) {
                        setShiftsData((prev) =>
                            prev.map((s) =>
                                s.id === shiftId ? { ...s, date } : s
                            )
                        )
                    }
                    setIsDraggingOver(false)
                }
            },
            onDragEnter: () => setIsDraggingOver(true),
            onDragLeave: () => setIsDraggingOver(false),
        })
    }, [shiftTypes, shiftsData, shiftsInDay, date, setShiftsData, isEditable])

    const totalHeight = HOURS.length * CELL_HEIGHT

    const holidayInfo = holidays.find((h) => {
        const d = new Date(date)
        return h.month === d.getUTCMonth() + 1 && h.day === d.getUTCDate()
    })

    const timeOffsForDate = getEmployeeTimeOffsForDate(date, employeeTimeOffs)

    return (
        <div ref={ref} className="border-l relative">
            <div
                className={`h-10 flex flex-col items-center justify-center border-b font-medium ${
                    isDraggingOver ? 'bg-accent' : ''
                } ${isNonWorkingDay ? 'bg-red-100 dark:bg-red-950' : ''}`}
            >
                <div>{dateLabel}</div>
                {timeOffsForDate.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                        {timeOffsForDate.map((timeOff, idx) => (
                            <div
                                key={idx}
                                className={`w-4 h-4 rounded-sm text-[10px] font-bold text-white flex items-center justify-center ${getTimeOffTypeColor(timeOff.type)}`}
                                title={`${timeOff.employeeName} - ${getTimeOffTypeLabel(timeOff.type) === 'V' ? 'Vacation' : getTimeOffTypeLabel(timeOff.type) === 'S' ? 'Sick Leave' : 'Personal Day'}`}
                            >
                                {getTimeOffTypeLabel(timeOff.type)}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative" style={{ height: totalHeight }}>
                {isNonWorkingDay && (
                    <>
                        <div className="absolute inset-0 bg-stripes opacity-10 pointer-events-none z-[1]" />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] text-red-500 font-bold text-xl opacity-20 pointer-events-none z-[2] whitespace-nowrap">
                            {holiday ? holidayInfo?.holidayName || 'Holiday' : 'Day Off'}
                        </div>
                    </>
                )}

                {HOURS.map((_, index) => (
                    <div
                        key={index}
                        className="absolute w-full border-b"
                        style={{
                            top: index * CELL_HEIGHT,
                            height: CELL_HEIGHT
                        }}
                    />
                ))}

                {shiftsInDay.map((shift) => (
                    <ShiftBox
                        key={shift.id}
                        shift={shift}
                        employees={employees}
                        shiftsData={shiftsData}
                        setShiftsData={setShiftsData}
                        date={date}
                        cellHeight={CELL_HEIGHT}
                    />
                ))}

                {previousDayShifts.map((shift) => (
                    <ShiftBox
                        key={`${shift.id}-nextday`}
                        shift={shift}
                        employees={employees}
                        shiftsData={shiftsData}
                        setShiftsData={setShiftsData}
                        date={previousDay}
                        cellHeight={CELL_HEIGHT}
                        isNextDayPart={true}
                    />
                ))}
            </div>
        </div>
    )
}
