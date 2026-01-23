'use client'
import { useEffect, useRef, useState } from 'react'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { toast } from 'sonner'
import ShiftBox from './ShiftBox'
import {Holiday, WorkDay, Shift, ShiftType, EmployeeMinData} from "@/types";
import { EmployeeTimeOff, TimeOffType } from "@/types/schedule";
import {
    getEmployeeTimeOff,
    getPreviousDay, getTimeOffColor,
    getTimeOffLabelKey,
    isHoliday,
    isWorkingDay,
    timeToMinutes
} from "@/helpers/dateHelper";

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

    const timeOffsForDate = employees
        .map(emp => {
            const timeOff = getEmployeeTimeOff(emp.id, date, employeeTimeOffs)
            return timeOff
                ? { ...timeOff, employeeName: emp.name }
                : null
        })
        .filter(Boolean) as (EmployeeTimeOff & { employeeName: string })[]

    return (
        <div ref={ref} className="border-l relative">
            <div className="h-10 flex flex-col items-center justify-center border-b font-medium">
                <div>{dateLabel}</div>

                {timeOffsForDate.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                        {timeOffsForDate.map((timeOff, idx) => (
                            <div
                                key={idx}
                                className={`w-4 h-4 rounded-sm text-[10px] font-bold flex items-center justify-center
                        ${getTimeOffColor(timeOff.type)}`}
                                title={`${timeOff.employeeName}`}
                            >
                                {getTimeOffLabelKey(timeOff.type).charAt(0)}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative" style={{height: totalHeight}}>
                {isNonWorkingDay && (
                    <>
                        <div className="absolute inset-0 bg-stripes opacity-10 pointer-events-none z-[1]"/>
                        <div
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] text-red-500 font-bold text-xl opacity-20 pointer-events-none z-[2] whitespace-nowrap">
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
