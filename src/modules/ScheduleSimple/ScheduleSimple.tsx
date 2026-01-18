"use client";

import {useMemo, useState} from "react";
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
import { ChevronLeft, ChevronRight, X, Filter } from "lucide-react";
import { DateData, EmployeeMinData, Holiday, Shift, ShiftType, WorkDay } from "@/types";
import { EmployeeTimeOff, TimeOffType } from "@/types/schedule";
import { transformToSimpleView } from "@/helpers/scheduleHelper";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { toast } from "sonner";
import ShiftTypeSmallCard from "@/components/cards/ShiftTypeSmallCard";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/shadcn/popover";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Label } from "@/components/ui/shadcn/label";
import DroppableCell from "@/modules/ScheduleSimple/DroppableCell";
import { useTranslations } from 'next-intl';
import {
    getEmployeeTimeOff,
    getHolidayName,
    getTimeOffColor,
    getTimeOffLabelKey,
    isHoliday,
    isWorkingDay
} from "@/helpers/dateHelper";

type SimpleViewProps = {
    employees: EmployeeMinData[];
    shiftTypes: ShiftType[];
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
};

export default function SimpleView({
                                       employees,
                                       shiftTypes,
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
                                   }: SimpleViewProps) {
    const t = useTranslations('schedule');
    const dates = daysOfMonth.map((d) => d.isoDate);
    const [selectedShiftTypes, setSelectedShiftTypes] = useState<number[]>([]);

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

    const rows = useMemo(
        () => transformToSimpleView(filteredEmployees, shiftsData, dates),
        [filteredEmployees, shiftsData, dates]
    );

    const handleShiftTypeFilterToggle = (shiftTypeId: number) => {
        setSelectedShiftTypes(prev =>
            prev.includes(shiftTypeId)
                ? prev.filter(id => id !== shiftTypeId)
                : [...prev, shiftTypeId]
        );
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
                startTime: shiftType.startTime,
                endTime: shiftType.endTime,
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
        <div className="flex flex-col gap-4 p-4">
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
                                            id={`filter-simple-${st.id}`}
                                            checked={selectedShiftTypes.includes(st.id)}
                                            onCheckedChange={() => handleShiftTypeFilterToggle(st.id)}
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
            </div>

            <div className="border rounded-lg p-4 bg-muted/50 flex-shrink-0">
                <h3 className="font-semibold mb-3">Available Shift Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
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

            <div className="flex-1 border rounded-lg overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px] sticky left-0 bg-background z-20 border-r">
                                Employee
                            </TableHead>
                            {daysOfMonth.map((day) => {
                                const holiday = isHoliday(day.isoDate, orgHolidays)
                                const working = isWorkingDay(day.isoDate, orgSchedule)
                                const isNonWorkingDay = holiday || !working

                                return (
                                    <TableHead
                                        key={day.isoDate}
                                        className={`text-center min-w-[150px] ${
                                            isNonWorkingDay ? 'bg-red-100 dark:bg-red-950' : ''
                                        }`}
                                    >
                                        <div className="flex flex-col">
                                            <span>{day.label}</span>
                                            {isNonWorkingDay && (
                                                <span className="text-[10px] text-red-600 dark:text-red-400 font-normal">
                                                    {holiday ? getHolidayName(day.isoDate, orgHolidays) : 'Day Off'}
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
                                <TableCell className="font-medium sticky left-0 bg-background z-10 border-r">
                                    <div className={"flex flex-row gap-2 justify-between items-center"}>
                                        <div>
                                            <div>{row.employeeName}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.position}
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                row.totalHours > 200
                                                    ? "destructive"
                                                    : row.totalHours > 180
                                                        ? "warning"
                                                        : "secondary"
                                            }
                                        >
                                            {row.totalHours.toFixed(1)}h
                                        </Badge>
                                    </div>
                                </TableCell>
                                {daysOfMonth.map((day) => {
                                    const assignment = row.days.get(day.isoDate);
                                    const holiday = isHoliday(day.isoDate, orgHolidays)
                                    const working = isWorkingDay(day.isoDate, orgSchedule)
                                    const isNonWorkingDay = holiday || !working
                                    const timeOff = getEmployeeTimeOff(row.employeeId, day.isoDate, employeeTimeOffs)

                                    return (
                                        <TableCell
                                            key={day.isoDate}
                                            className={`p-2 ${
                                                timeOff
                                                    ? getTimeOffColor(timeOff.type)
                                                    : isNonWorkingDay
                                                        ? 'bg-red-50 dark:bg-red-950/10'
                                                        : ''
                                            }`}
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
    );
}
