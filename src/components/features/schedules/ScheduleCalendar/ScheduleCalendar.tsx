'use client'

import { Button } from '@/components/ui/shadcn/button'
import { PanelLeft, PanelTop, Filter, X } from 'lucide-react'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/shadcn/command'
import DayContainer from './DayContainer'
import { DateData, EmployeeMinData, Department, Holiday, Shift, ShiftTemplate, WorkDay } from '@/types'
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
import { WarningMessage } from "@/app/(private)/(employer)/schedules/[departmentId]/page"
import { MonthNavigator } from "@/components/features/schedules/MonthNavigator"
import { MessageIndicator } from "@/components/features/schedules/MessageIndicator"
import ScheduleData from "@/components/features/schedules/ScheduleData"

type ScheduleCalendarProps = {
    shiftsData: Shift[]
    setShiftsData?: Dispatch<SetStateAction<Shift[]>>
    shiftTypes: ShiftTemplate[]
    employees: EmployeeMinData[]
    departments?: Department[]
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
    departments = [],
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
    const [selectedShiftTemplateIds, setSelectedShiftTemplateIds] = useState<number[]>([])
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null)
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
    const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false)
    const [employeeSearchValue, setEmployeeSearchValue] = useState("")

    // Set default department to first department when departments become available
    useEffect(() => {
        if (departments.length > 0 && selectedDepartmentId === null) {
            setSelectedDepartmentId(departments[0].id)
        }
    }, [departments.length])

    const selectedDepartment = useMemo(
        () => departments.find(g => g.id === selectedDepartmentId) ?? null,
        [departments, selectedDepartmentId]
    )

    // Shift types that belong to the selected department
    const departmentShiftTemplates = useMemo(
        () => selectedDepartmentId !== null
            ? shiftTypes.filter(st => st.departmentId === selectedDepartmentId)
            : shiftTypes,
        [shiftTypes, selectedDepartmentId]
    )

    // Employees in the selected department
    const departmentEmployees = useMemo(
        () => selectedDepartment
            ? employees.filter(emp => emp.departmentNames.includes(selectedDepartment.name))
            : employees,
        [employees, selectedDepartment]
    )

    // Shifts that belong to the selected department (by shift type)
    const departmentShifts = useMemo(() => {
        const departmentShiftTemplateIds = new Set(departmentShiftTemplates.map(st => st.id))
        return shiftsData.filter(s => departmentShiftTemplateIds.has(s.shiftTypeId))
    }, [shiftsData, departmentShiftTemplates])

    // Further filter employees by selected shift types (inside the department)
    const visibleEmployees = useMemo(() => {
        let result = departmentEmployees

        if (selectedShiftTemplateIds.length > 0) {
            const empIds = new Set<number>()
            departmentShifts.forEach(shift => {
                if (selectedShiftTemplateIds.includes(shift.shiftTypeId)) {
                    shift.employees.forEach(e => empIds.add(e.id))
                }
            })
            result = result.filter(emp => empIds.has(emp.id))
        }

        if (selectedEmployeeId !== null) {
            result = result.filter(emp => emp.id === selectedEmployeeId)
        }

        return result
    }, [departmentEmployees, selectedShiftTemplateIds, departmentShifts, selectedEmployeeId])

    const employeeSearchSuggestions = useMemo(() => {
        if (!employeeSearchValue.trim()) return []
        const query = employeeSearchValue.toLowerCase()
        return departmentEmployees.filter(emp => emp.name.toLowerCase().includes(query)).slice(0, 8)
    }, [departmentEmployees, employeeSearchValue])

    // Shift types visible in the panel (filtered within department)
    const visibleShiftTemplates = useMemo(
        () => selectedShiftTemplateIds.length > 0
            ? departmentShiftTemplates.filter(st => selectedShiftTemplateIds.includes(st.id))
            : departmentShiftTemplates,
        [departmentShiftTemplates, selectedShiftTemplateIds]
    )

    const handleShiftTemplateFilterToggle = (id: number) => {
        setSelectedShiftTemplateIds(prev =>
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

                {/* Department selector */}
                {departments.length > 0 && (
                    <Select
                        value={selectedDepartmentId?.toString() ?? ''}
                        onValueChange={(v) => {
                            setSelectedDepartmentId(Number(v))
                            setSelectedShiftTemplateIds([])
                        }}
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map(g => (
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

                {/* Employee search combobox */}
                <div className="relative">
                <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={`w-44 justify-start font-normal ${selectedEmployeeId ? "pr-7" : ""}`}
                            role="combobox"
                        >
                            <span className="truncate text-sm">
                                {selectedEmployeeId
                                    ? employees.find(e => e.id === selectedEmployeeId)?.name
                                    : "Search employee..."}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="start">
                        <Command>
                            <CommandInput
                                placeholder="Search employee..."
                                value={employeeSearchValue}
                                onValueChange={setEmployeeSearchValue}
                            />
                            <CommandList>
                                <CommandEmpty>No employees found</CommandEmpty>
                                <CommandGroup>
                                    {employeeSearchSuggestions.map(emp => (
                                        <CommandItem
                                            key={emp.id}
                                            value={emp.name}
                                            onSelect={() => {
                                                setSelectedEmployeeId(emp.id)
                                                setEmployeeSearchValue("")
                                                setEmployeeSearchOpen(false)
                                            }}
                                        >
                                            {emp.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {selectedEmployeeId && (
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => { setSelectedEmployeeId(null); setEmployeeSearchValue("") }}
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
                </div>

                {isEditable && (
                    <>
                        {/* Shift type filter within the selected department */}
                        {departmentShiftTemplates.length > 0 && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Filter className={selectedShiftTemplateIds.length > 0 ? 'text-primary' : ''} />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72">
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-sm">Filter by Shift Type</h4>
                                        <div className="space-y-2">
                                            {departmentShiftTemplates.map(st => (
                                                <div key={st.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`cal-filter-${st.id}`}
                                                        checked={selectedShiftTemplateIds.includes(st.id)}
                                                        onCheckedChange={() => handleShiftTemplateFilterToggle(st.id)}
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
                                        {selectedShiftTemplateIds.length > 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => setSelectedShiftTemplateIds([])}
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
                shiftTypes={visibleShiftTemplates}
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
                                    shiftTypes={departmentShiftTemplates}
                                    employees={departmentEmployees}
                                    shiftsData={departmentShifts}
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
