"use client";

import {useEffect, useMemo, useRef, useState} from "react";
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
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { DateData, EmployeeMinData, Holiday, Shift, ShiftType, WorkDay } from "@/types";
import { transformToSimpleView } from "@/helpers/scheduleHelper";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { toast } from "sonner";
import ShiftTypeCard from "@/components/cards/ShiftTypeCard";

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
};

function isHoliday(date: string, holidays: Holiday[]) {
    const d = new Date(date)
    return holidays.some(h => h.month === d.getMonth() + 1 && h.day === d.getDate())
}

function isWorkingDay(date: string, workDays: WorkDay[]) {
    const d = new Date(date)
    const dayOfWeek = d.getDay()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const currentDayName = dayNames[dayOfWeek]
    return workDays.some(wd => wd.dayOfWeek === currentDayName)
}

function getHolidayName(date: string, holidays: Holiday[]) {
    const d = new Date(date)
    const holiday = holidays.find(h => h.month === d.getMonth() + 1 && h.day === d.getDate())
    return holiday?.holidayName || 'Holiday'
}

function DroppableCell({
                           employeeId,
                           date,
                           assignment,
                           onAssign,
                           onRemove,
                           isNonWorkingDay,
                       }: {
    employeeId: number;
    date: string;
    assignment: any;
    onAssign: (employeeId: number, date: string, shiftTypeId: number) => void;
    onRemove: (employeeId: number, date: string) => void;
    isNonWorkingDay: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    useEffect(() => {
        if (!ref.current) return;
        return dropTargetForElements({
            element: ref.current,
            onDrop: ({ source }) => {
                if (source.data.type === "shiftType") {
                    const shiftTypeId = source.data.id as number;
                    onAssign(employeeId, date, shiftTypeId);
                }
                setIsDraggingOver(false);
            },
            onDragEnter: () => setIsDraggingOver(true),
            onDragLeave: () => setIsDraggingOver(false),
        });
    }, [employeeId, date, onAssign]);

    if (isNonWorkingDay) {
        return (
            <div className="min-h-[60px] p-2 rounded bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                    Off
                </span>
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className={`min-h-[60px] p-2 rounded transition-colors ${
                isDraggingOver ? "bg-accent border-2 border-dashed border-primary" : ""
            }`}
        >
            {assignment ? (
                <div
                    className="relative p-2 rounded border-l-4 text-xs bg-card"
                    style={{ borderLeftColor: assignment.color }}
                >
                    <div className="flex items-center justify-between gap-1">
                        <span className="font-medium">{assignment.shiftTypeName}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => onRemove(employeeId, date)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="text-muted-foreground text-[10px]">
                        {assignment.startTime.slice(0, 5)} - {assignment.endTime.slice(0, 5)}
                    </div>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Drop shift here
                </div>
            )}
        </div>
    );
}

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
                                   }: SimpleViewProps) {
    const dates = daysOfMonth.map((d) => d.isoDate);

    const rows = useMemo(
        () => transformToSimpleView(employees, shiftsData, dates),
        [employees, shiftsData, dates]
    );

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
            </div>

            <div className="border rounded-lg p-4 bg-muted/50 flex-shrink-0">
                <h3 className="font-semibold mb-3">Available Shift Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {shiftTypes.map((st) => (
                        <ShiftTypeCard
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

                                    return (
                                        <TableCell
                                            key={day.isoDate}
                                            className={`p-2 ${
                                                isNonWorkingDay ? 'bg-red-50 dark:bg-red-950/10' : ''
                                            }`}
                                        >
                                            <DroppableCell
                                                employeeId={row.employeeId}
                                                date={day.isoDate}
                                                assignment={assignment}
                                                onAssign={assignShift}
                                                onRemove={removeShift}
                                                isNonWorkingDay={isNonWorkingDay}
                                            />
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
