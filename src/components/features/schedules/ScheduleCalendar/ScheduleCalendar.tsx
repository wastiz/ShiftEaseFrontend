'use client'

import { Button } from '@/components/ui/shadcn/button'
import { PanelLeft, PanelTop, Filter } from 'lucide-react'
import DayContainer from './DayContainer'
import { DateData, EmployeeMinData, Group, Holiday, Shift, ShiftType, WorkDay } from '@/types'
import { EmployeeTimeOff } from '@/types/schedule'
import { Dispatch, SetStateAction, useState, useMemo, useEffect } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/shadcn/popover'
import { Checkbox } from '@/components/ui/shadcn/checkbox'
import { Label } from '@/components/ui/shadcn/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/shadcn/select'
import { WarningMessage } from "@/app/(private)/(employer)/schedules/[groupId]/page"
import { MonthNavigator } from "@/components/features/schedules/MonthNavigator"
import { MessageIndicator } from "@/components/features/schedules/MessageIndicator"
import ScheduleData from "@/components/features/schedules/ScheduleData"

type ScheduleCalendarProps = {
    shiftsData: Shift[]
    setShiftsData?: Dispatch<SetStateAction<Shift[]>>
    shiftTypes: ShiftType[]
    employees: EmployeeMinData[]
    groups?: Group[]
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
    groups = [],
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
    const [selectedShiftTypeIds, setSelectedShiftTypeIds] = useState<number[]>([])
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)

    // Set default group to first group when groups become available
    useEffect(() => {
        if (groups.length > 0 && selectedGroupId === null) {
            setSelectedGroupId(groups[0].id)
        }
    }, [groups.length])

    const selectedGroup = useMemo(
        () => groups.find(g => g.id === selectedGroupId) ?? null,
        [groups, selectedGroupId]
    )

    // Shift types that belong to the selected group
    const groupShiftTypes = useMemo(
        () => selectedGroupId !== null
            ? shiftTypes.filter(st => st.groupId === selectedGroupId)
            : shiftTypes,
        [shiftTypes, selectedGroupId]
    )

    // Employees in the selected group
    const groupEmployees = useMemo(
        () => selectedGroup
            ? employees.filter(emp => emp.groupNames.includes(selectedGroup.name))
            : employees,
        [employees, selectedGroup]
    )

    // Shifts that belong to the selected group (by shift type)
    const groupShifts = useMemo(() => {
        const groupShiftTypeIds = new Set(groupShiftTypes.map(st => st.id))
        return shiftsData.filter(s => groupShiftTypeIds.has(s.shiftTypeId))
    }, [shiftsData, groupShiftTypes])

    // Further filter employees by selected shift types (inside the group)
    const visibleEmployees = useMemo(() => {
        if (selectedShiftTypeIds.length === 0) return groupEmployees

        const empIds = new Set<number>()
        groupShifts.forEach(shift => {
            if (selectedShiftTypeIds.includes(shift.shiftTypeId)) {
                shift.employees.forEach(e => empIds.add(e.id))
            }
        })
        return groupEmployees.filter(emp => empIds.has(emp.id))
    }, [groupEmployees, selectedShiftTypeIds, groupShifts])

    // Shift types visible in the panel (filtered within group)
    const visibleShiftTypes = useMemo(
        () => selectedShiftTypeIds.length > 0
            ? groupShiftTypes.filter(st => selectedShiftTypeIds.includes(st.id))
            : groupShiftTypes,
        [groupShiftTypes, selectedShiftTypeIds]
    )

    const handleShiftTypeFilterToggle = (id: number) => {
        setSelectedShiftTypeIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-62px)]">

            <div className="flex items-center gap-3 flex-shrink-0 m-4">
                <MonthNavigator
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    isConfirmed={isConfirmed}
                    onChange={(month, year) => {
                        setCurrentMonth(month)
                        setCurrentYear(year)
                    }}
                />

                {/* Group selector */}
                {groups.length > 0 && (
                    <Select
                        value={selectedGroupId?.toString() ?? ''}
                        onValueChange={(v) => {
                            setSelectedGroupId(Number(v))
                            setSelectedShiftTypeIds([])
                        }}
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                            {groups.map(g => (
                                <SelectItem key={g.id} value={g.id.toString()}>
                                    <div className="flex items-center gap-2">
                                        {g.color && (
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: g.color }}
                                            />
                                        )}
                                        {g.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {isEditable && (
                    <>
                        {/* Shift type filter within the selected group */}
                        {groupShiftTypes.length > 0 && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Filter className={selectedShiftTypeIds.length > 0 ? 'text-primary' : ''} />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72">
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-sm">Filter by Shift Type</h4>
                                        <div className="space-y-2">
                                            {groupShiftTypes.map(st => (
                                                <div key={st.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`cal-filter-${st.id}`}
                                                        checked={selectedShiftTypeIds.includes(st.id)}
                                                        onCheckedChange={() => handleShiftTypeFilterToggle(st.id)}
                                                    />
                                                    <Label
                                                        htmlFor={`cal-filter-${st.id}`}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <div
                                                            className="w-3 h-3 rounded shrink-0"
                                                            style={{ backgroundColor: st.color }}
                                                        />
                                                        {st.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedShiftTypeIds.length > 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => setSelectedShiftTypeIds([])}
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setLayoutPosition(p => p === 'left' ? 'top' : 'left')}
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
                shiftTypes={visibleShiftTypes}
                filteredEmployees={visibleEmployees}
            >
                <section className="flex-1 flex flex-col min-w-0 space-y-4">
                    <div className="flex-1 border rounded-lg overflow-auto">
                        <div
                            className="grid min-w-max"
                            style={{
                                gridTemplateColumns: `100px repeat(${daysOfMonth.length}, 180px)`,
                            }}
                        >
                            {/* Time column */}
                            <div className="sticky left-0 z-10 shadow-md bg-background">
                                <div className="h-10 flex items-center justify-center font-medium border-b border-r bg-black" />
                                {Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`).map(h => (
                                    <div
                                        key={h}
                                        className="h-10 bg-black border-b border-r flex items-center justify-center text-sm"
                                    >
                                        {h}
                                    </div>
                                ))}
                            </div>

                            {daysOfMonth.map(day => (
                                <DayContainer
                                    key={day.isoDate}
                                    date={day.isoDate}
                                    dateLabel={day.label}
                                    shiftTypes={groupShiftTypes}
                                    employees={groupEmployees}
                                    shiftsData={groupShifts}
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
