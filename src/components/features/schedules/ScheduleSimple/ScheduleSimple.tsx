"use client";

import { useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/shadcn/table";
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Filter, ClipboardCheck, Maximize2, Minimize2, PanelLeft, PanelTop, Settings, X } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/shadcn/command";
import { DateData, EmployeeMinData, Department, Holiday, Shift, ShiftTemplate, WorkDay } from "@/types";
import { EmployeeTimeOff } from "@/types/schedule";
import { transformToSimpleView } from "@/helpers/scheduleHelper";
import { toast } from "sonner";
import ShiftTemplateSmallCard from "@/components/ui/cards/ShiftTypeSmallCard";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/shadcn/popover";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Label } from "@/components/ui/shadcn/label";
import DroppableCell from "@/components/features/schedules/ScheduleSimple/DroppableCell";
import { useTranslations } from 'next-intl';
import {
    getEmployeeTimeOff,
    getHolidayName,
    getTimeOffColor,
    getTimeOffLabelKey,
    timeToMinutes,
} from "@/helpers/dateHelper";
import { WarningMessage } from "@/app/(private)/(employer)/schedules/[departmentId]/page";
import { MonthNavigator } from "@/components/features/schedules/MonthNavigator";
import { MessageIndicator } from "@/components/features/schedules/MessageIndicator";
import { CoverageCheckModal } from "@/components/features/schedules/CoverageCheckModal";

type SimpleViewProps = {
    employees: EmployeeMinData[];
    shiftTypes: ShiftTemplate[];
    departments?: Department[];
    shiftsData: Shift[];
    setShiftsData: (shifts: Shift[]) => void;
    daysOfMonth: DateData[];
    currentMonth: number;
    currentYear: number;
    setCurrentMonth: (month: number) => void;
    setCurrentYear: (year: number) => void;
    isConfirmed: boolean;
    orgHolidays?: Holiday[];
    orgSchedule?: WorkDay[];
    employeeTimeOffs?: EmployeeTimeOff[];
    warningMessage: WarningMessage | null;
};

export default function SimpleView({
    employees,
    shiftTypes,
    departments = [],
    shiftsData,
    setShiftsData,
    daysOfMonth,
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    isConfirmed,
    orgHolidays = [],
    orgSchedule = [],
    employeeTimeOffs = [],
    warningMessage,
}: SimpleViewProps) {
    const t = useTranslations('schedule');
    const dates = daysOfMonth.map((d) => d.isoDate);
    const [selectedShiftTemplates, setSelectedShiftTemplates] = useState<number[]>([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);
    const [employeeSearchValue, setEmployeeSearchValue] = useState("");
    const [coverageModalOpen, setCoverageModalOpen] = useState(false);
    const [isCompact, setIsCompact] = useState(false);
    const [layoutPosition, setLayoutPosition] = useState<'left' | 'top'>('top');

    const [showWeekendHighlight, setShowWeekendHighlight] = useState(true);
    const [showHolidayHighlight, setShowHolidayHighlight] = useState(true);
    const [showShortenedHighlight, setShowShortenedHighlight] = useState(true);

    const filteredEmployees = useMemo(() => {
        let result = employees;

        if (selectedDepartmentId !== null) {
            const department = departments.find(g => g.id === selectedDepartmentId);
            if (department) {
                result = result.filter(emp => emp.departmentNames.includes(department.name));
            }
        }

        if (selectedShiftTemplates.length > 0) {
            const employeeIdsWithSelectedShifts = new Set<number>();
            shiftsData.forEach(shift => {
                if (selectedShiftTemplates.includes(shift.shiftTypeId)) {
                    shift.employees.forEach(emp => employeeIdsWithSelectedShifts.add(emp.id));
                }
            });
            result = result.filter(emp => employeeIdsWithSelectedShifts.has(emp.id));
        }

        if (selectedEmployeeId !== null) {
            result = result.filter(emp => emp.id === selectedEmployeeId);
        }

        return result;
    }, [employees, departments, selectedDepartmentId, selectedShiftTemplates, shiftsData, selectedEmployeeId]);

    const employeeSearchSuggestions = useMemo(() => {
        if (!employeeSearchValue.trim()) return [];
        const query = employeeSearchValue.toLowerCase();
        return employees.filter(emp => emp.name.toLowerCase().includes(query)).slice(0, 8);
    }, [employees, employeeSearchValue]);

    const rows = useMemo(
        () => transformToSimpleView(filteredEmployees, shiftsData, dates, shiftTypes),
        [filteredEmployees, shiftsData, dates, shiftTypes]
    );

    const handleShiftTemplateFilterToggle = (shiftTypeId: number) => {
        setSelectedShiftTemplates(prev =>
            prev.includes(shiftTypeId)
                ? prev.filter(id => id !== shiftTypeId)
                : [...prev, shiftTypeId]
        );
    };

    const handleDepartmentFilterToggle = (departmentId: number) => {
        setSelectedDepartmentId(prev => prev === departmentId ? null : departmentId);
    };

    const assignShift = (employeeId: number, date: string, shiftTypeId: number) => {
        const shiftType = shiftTypes.find((st) => st.id === shiftTypeId);
        if (!shiftType) {
            toast.error("Shift type not found");
            return;
        }

        const existingShift = shiftsData.find(
            (s) => s.date === date && s.employees.some((e) => e.id === employeeId)
        );

        if (existingShift) {
            toast.warning("Employee already has a shift on this day");
            return;
        }

        let sTime = shiftType.startTime
        let eTime = shiftType.endTime

        const holidayInfo = orgHolidays.find((h) => {
            const d = new Date(date)
            return h.month === d.getUTCMonth() + 1 && h.day === d.getUTCDate()
        })
        const isShortenedDay = holidayInfo?.isShortenedDay

        if (isShortenedDay && holidayInfo?.startTime && holidayInfo?.endTime) {
            const shiftStartM = timeToMinutes(sTime)
            const shiftEndM = timeToMinutes(eTime)
            const hStartM = timeToMinutes(holidayInfo.startTime)
            const hEndM = timeToMinutes(holidayInfo.endTime)

            if (shiftStartM < shiftEndM && hStartM < hEndM) {
                if (shiftStartM < hStartM) sTime = holidayInfo.startTime
                if (shiftEndM > hEndM) eTime = holidayInfo.endTime
                toast.info('Shift adjusted to shortened holiday hours')
            }
        }

        const existingShiftForType = shiftsData.find(
            (s) => s.date === date && s.shiftTypeId === shiftTypeId
        );

        if (existingShiftForType) {
            const updatedShifts = shiftsData.map((s) =>
                s.id === existingShiftForType.id
                    ? {
                        ...s,
                        employees: [
                            ...s.employees,
                            {
                                id: employeeId,
                                name: employees.find((e) => e.id === employeeId)?.name || "",
                                note: undefined,
                            },
                        ],
                    }
                    : s
            );
            setShiftsData(updatedShifts);
        } else {
            const newShift: Shift = {
                id: Date.now(),
                date,
                shiftTypeId: shiftType.id,
                shiftTypeName: shiftType.name,
                startTime: sTime,
                endTime: eTime,
                color: shiftType.color,
                employeeNeeded: 1,
                employees: [
                    {
                        id: employeeId,
                        name: employees.find((e) => e.id === employeeId)?.name || "",
                        note: undefined,
                    },
                ],
            };
            setShiftsData([...shiftsData, newShift]);
        }
    };

    const removeShift = (employeeId: number, date: string) => {
        const updatedShifts = shiftsData
            .map((shift) => {
                if (shift.date !== date) return shift;

                const updatedEmployees = shift.employees.filter((e) => e.id !== employeeId);

                if (updatedEmployees.length === 0) return null;

                return { ...shift, employees: updatedEmployees };
            })
            .filter((shift): shift is Shift => shift !== null);

        setShiftsData(updatedShifts);
    };

    const updateNote = (employeeId: number, date: string, note: string) => {
        const updatedShifts = shiftsData.map((shift) => {
            if (shift.date !== date) return shift;

            const hasEmployee = shift.employees.some((e) => e.id === employeeId);
            if (!hasEmployee) return shift;

            return {
                ...shift,
                employees: shift.employees.map((e) =>
                    e.id === employeeId ? { ...e, note } : e
                ),
            };
        });

        setShiftsData(updatedShifts);
        toast.success('Note updated');
    };

    return (
        <div className="flex flex-col gap-4 p-4 h-full overflow-hidden">
            <div className="flex items-center gap-3 flex-shrink-0">
                <MonthNavigator
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    isConfirmed={isConfirmed}
                    onChange={(month, year) => {
                        setCurrentMonth(month);
                        setCurrentYear(year);
                    }}
                />

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCoverageModalOpen(true)}
                    title="Coverage Check"
                >
                    <ClipboardCheck className="h-4 w-4" />
                </Button>

                {warningMessage && (
                    <MessageIndicator
                        message={warningMessage.message}
                        messageType="warning"
                    />
                )}


                {/* Employee search combobox */}
                <div className="relative ml-auto">
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
                                                setSelectedEmployeeId(emp.id);
                                                setEmployeeSearchValue("");
                                                setEmployeeSearchOpen(false);
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
                        onClick={() => { setSelectedEmployeeId(null); setEmployeeSearchValue(""); }}
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Filter className={(selectedShiftTemplates.length > 0 || selectedDepartmentId !== null) ? "text-primary" : ""} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="space-y-4">
                            {departments.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Filter by Department</h4>
                                    <div className="space-y-2">
                                        {departments.map((g) => (
                                            <div key={g.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`filter-department-${g.id}`}
                                                    checked={selectedDepartmentId === g.id}
                                                    onCheckedChange={() => handleDepartmentFilterToggle(g.id)}
                                                />
                                                <Label
                                                    htmlFor={`filter-department-${g.id}`}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    {g.color && (
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: g.color }}
                                                        />
                                                    )}
                                                    {g.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Filter by Shift Type</h4>
                                <div className="space-y-2">
                                    {shiftTypes.map((st) => (
                                        <div key={st.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`filter-simple-${st.id}`}
                                                checked={selectedShiftTemplates.includes(st.id)}
                                                onCheckedChange={() => handleShiftTemplateFilterToggle(st.id)}
                                            />
                                            <Label
                                                htmlFor={`filter-simple-${st.id}`}
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
                            </div>
                            {(selectedShiftTemplates.length > 0 || selectedDepartmentId !== null) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setSelectedShiftTemplates([]); setSelectedDepartmentId(null); setSelectedEmployeeId(null); }}
                                    className="w-full"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm">Highlights</h4>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="highlight-weekend"
                                        checked={showWeekendHighlight}
                                        onCheckedChange={(c) => setShowWeekendHighlight(!!c)}
                                    />
                                    <Label htmlFor="highlight-weekend" className="flex items-center gap-2 cursor-pointer text-sm font-normal">
                                        <div className="w-3 h-3 rounded ring-1 ring-inset ring-yellow-300/60 bg-yellow-50/30" />
                                        Weekends
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="highlight-holiday"
                                        checked={showHolidayHighlight}
                                        onCheckedChange={(c) => setShowHolidayHighlight(!!c)}
                                    />
                                    <Label htmlFor="highlight-holiday" className="flex items-center gap-2 cursor-pointer text-sm font-normal">
                                        <div className="w-3 h-3 rounded bg-red-100" />
                                        Holidays / Day Off
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="highlight-shortened"
                                        checked={showShortenedHighlight}
                                        onCheckedChange={(c) => setShowShortenedHighlight(!!c)}
                                    />
                                    <Label htmlFor="highlight-shortened" className="flex items-center gap-2 cursor-pointer text-sm font-normal">
                                        <div className="w-3 h-3 rounded bg-orange-100" />
                                        Shortened Days
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setLayoutPosition(p => p === 'left' ? 'top' : 'left')}
                    title={layoutPosition === 'left' ? "Top Layout" : "Left Layout"}
                >
                    {layoutPosition === 'left' ? <PanelTop className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsCompact(!isCompact)}
                    title={isCompact ? t('fullView') : t('compactView')}
                >
                    {isCompact ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
            </div>

            <div className={`flex flex-1 min-h-0 ${layoutPosition === 'left' ? 'flex-row gap-4' : 'flex-col gap-4'}`}>
                <div className={`border rounded-lg p-4 bg-muted/50 flex-shrink-0 flex flex-col ${layoutPosition === 'left' ? 'w-64 border-r overflow-y-auto max-h-[calc(100vh-200px)]' : ''}`}>
                    <h3 className="font-semibold mb-3">{t("availableShiftTemplates")}</h3>
                    {layoutPosition === 'top' ? (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {shiftTypes.map((st) => (
                                <ShiftTemplateSmallCard
                                    key={st.id}
                                    name={st.name}
                                    id={st.id}
                                    startTime={st.startTime}
                                    endTime={st.endTime}
                                    color={st.color}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {shiftTypes.map((st) => (
                                <ShiftTemplateSmallCard
                                    key={st.id}
                                    name={st.name}
                                    id={st.id}
                                    startTime={st.startTime}
                                    endTime={st.endTime}
                                    color={st.color}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className={`flex-1 border rounded-lg overflow-auto ${isCompact ? "overflow-x-hidden" : ""}`}>
                    <Table noWrapper className={isCompact ? "table-fixed w-full" : ""}>
                        <TableHeader className="sticky top-0 z-20 bg-background">
                            <TableRow>
                                <TableHead className={`${isCompact ? "w-[120px] px-2 text-[10px]" : "w-[180px]"} sticky top-0 left-0 bg-background z-30 border-r`}>
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="truncate">Employees</span>
                                        <Badge variant="secondary" className={isCompact ? "px-1 text-[9px]" : ""}>
                                            {rows.reduce((sum, r) => sum + r.totalHours, 0).toFixed(isCompact ? 0 : 1)}h
                                        </Badge>
                                    </div>
                                </TableHead>
                                {daysOfMonth.map((day) => {
                                    const holidayInfo = orgHolidays.find((h) => {
                                        const d = new Date(day.isoDate)
                                        return h.month === d.getUTCMonth() + 1 && h.day === d.getUTCDate()
                                    })
                                    const dayDate = new Date(day.isoDate)
                                    const isWeekend = dayDate.getUTCDay() === 0 || dayDate.getUTCDay() === 6
                                    const holiday = !!holidayInfo
                                    const isShortenedDay = holidayInfo?.isShortenedDay
                                    const isNonWorkingDay = (holiday && !isShortenedDay)

                                    return (
                                        <TableHead
                                            key={day.isoDate}
                                            className={`text-center transition-colors ${isCompact ? 'p-0 px-0.5 text-[10px] min-w-0' : 'min-w-[150px]'} ${
                                                isNonWorkingDay && showHolidayHighlight ? 'bg-red-100 dark:bg-red-950' : ''
                                            } ${isWeekend && showWeekendHighlight ? 'ring-1 ring-inset ring-yellow-300/60 dark:ring-yellow-700/50 bg-yellow-50/30 dark:bg-yellow-900/10' : ''} ${isShortenedDay && showShortenedHighlight ? 'bg-orange-100 dark:bg-orange-950/50' : ''}`}
                                        >
                                            <div className="flex flex-col items-center">
                                                <span>{isCompact ? day.label.split(' ')[0] : day.label}</span>
                                                {isNonWorkingDay && !isCompact && (
                                                    <span className="text-[10px] text-red-600 dark:text-red-400 font-normal">
                                                        {holiday ? holidayInfo?.holidayName || getHolidayName(day.isoDate, orgHolidays) : 'Day Off'}
                                                    </span>
                                                )}
                                                {isShortenedDay && !isNonWorkingDay && !isCompact && (
                                                    <span className="text-[10px] text-orange-500 font-normal truncate max-w-full px-1">
                                                        {holidayInfo?.startTime}-{holidayInfo?.endTime}
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.employeeId}>
                                    <TableCell className={`font-medium sticky left-0 bg-background z-10 border-r ${isCompact ? "px-2 py-1 text-[11px]" : ""}`}>
                                        <div className="flex flex-row gap-2 justify-between items-center">
                                            <div className="min-w-0">
                                                <div className="truncate">{row.employeeName}</div>
                                                {!isCompact && (
                                                    <div className="flex items-center gap-1 flex-wrap mt-0.5">
                                                        {row.departmentNames.slice(0, 2).map(name => (
                                                            <span key={name} className="text-xs text-muted-foreground">
                                                                {name}
                                                            </span>
                                                        ))}
                                                        {row.departmentNames.length > 2 && (
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <button className="text-xs text-primary underline-offset-2 hover:underline cursor-pointer">
                                                                        +{row.departmentNames.length - 2} more
                                                                    </button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-48 p-2" side="right">
                                                                    <p className="text-xs font-medium mb-1.5 text-muted-foreground">All departments</p>
                                                                    <ul className="space-y-1">
                                                                        {row.departmentNames.map(name => (
                                                                            <li key={name} className="text-sm">{name}</li>
                                                                        ))}
                                                                    </ul>
                                                                </PopoverContent>
                                                            </Popover>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <Badge
                                                className={isCompact ? "px-1 text-[9px]" : ""}
                                                variant={
                                                    row.totalHours > 200
                                                        ? "destructive"
                                                        : row.totalHours > 180
                                                            ? "warning"
                                                            : "secondary"
                                                }
                                            >
                                                {row.totalHours.toFixed(isCompact ? 0 : 1)}h
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    {daysOfMonth.map((day) => {
                                        const assignment = row.days.get(day.isoDate);
                                        const holidayInfo = orgHolidays.find((h) => {
                                            const d = new Date(day.isoDate)
                                            return h.month === d.getUTCMonth() + 1 && h.day === d.getUTCDate()
                                        })
                                        const dayDate = new Date(day.isoDate)
                                        const isWeekend = dayDate.getUTCDay() === 0 || dayDate.getUTCDay() === 6
                                        const holiday = !!holidayInfo
                                        const isShortenedDay = holidayInfo?.isShortenedDay
                                        const isNonWorkingDay = (holiday && !isShortenedDay)
                                        const timeOff = getEmployeeTimeOff(row.employeeId, day.isoDate, employeeTimeOffs)

                                        return (
                                            <TableCell
                                                key={day.isoDate}
                                                className={`transition-colors ${isCompact ? "p-0 px-0.5" : "p-2"} ${
                                                    timeOff
                                                        ? getTimeOffColor(timeOff.type)
                                                        : isNonWorkingDay && showHolidayHighlight
                                                            ? 'bg-red-50 dark:bg-red-950/10'
                                                            : isShortenedDay && showShortenedHighlight
                                                                ? 'bg-orange-50 dark:bg-orange-950/10'
                                                                : ''
                                                } ${isWeekend && showWeekendHighlight ? 'ring-1 ring-inset ring-yellow-300/60 dark:ring-yellow-700/50 bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}
                                            >
                                                {timeOff ? (
                                                    <div className="text-xs text-center py-1 px-2 rounded border">
                                                        <div className="font-medium">{t(getTimeOffLabelKey(timeOff.type))}</div>
                                                    </div>
                                                ) : (
                                                    <DroppableCell
                                                        employeeId={row.employeeId}
                                                        date={day.isoDate}
                                                        assignment={assignment}
                                                        onAssign={assignShift}
                                                        onRemove={removeShift}
                                                        onUpdateNote={updateNote}
                                                        isNonWorkingDay={isNonWorkingDay}
                                                        isCompact={isCompact}
                                                    />
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <CoverageCheckModal
                open={coverageModalOpen}
                onOpenChange={setCoverageModalOpen}
                shiftTypes={shiftTypes}
                shiftsData={shiftsData}
                daysOfMonth={daysOfMonth}
                orgHolidays={orgHolidays}
                orgSchedule={orgSchedule}
                departments={departments}
            />
        </div>
    );
}
