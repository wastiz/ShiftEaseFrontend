import { Shift, EmployeeMinData, ShiftType } from "@/types";

export type EmployeeScheduleRow = {
    employeeId: number;
    employeeName: string;
    position: string;
    totalHours: number;
    days: Map<string, DayAssignment>;
};

export type DayAssignment = {
    shiftId: number;
    shiftTypeId: number;
    shiftTypeName: string;
    startTime: string;
    endTime: string;
    color: string;
};

export function transformToSimpleView(
    employees: EmployeeMinData[],
    shifts: Shift[],
    daysOfMonth: string[]
): EmployeeScheduleRow[] {
    return employees.map((emp) => {
        const employeeShifts = shifts.filter((shift) =>
            shift.employees.some((e) => e.id === emp.id)
        );

        const daysMap = new Map<string, DayAssignment>();

        employeeShifts.forEach((shift) => {
            daysMap.set(shift.date, {
                shiftId: shift.id,
                shiftTypeId: shift.shiftTypeId,
                shiftTypeName: shift.shiftTypeName,
                startTime: shift.startTime,
                endTime: shift.endTime,
                color: shift.color,
            });
        });

        const totalHours = employeeShifts.reduce((sum, shift) => {
            const duration = calculateShiftDuration(shift.startTime, shift.endTime);
            return sum + duration;
        }, 0);

        return {
            employeeId: emp.id,
            employeeName: emp.name,
            position: emp.position || "Employee",
            totalHours,
            days: daysMap,
        };
    });
}

export function transformFromSimpleView(
    rows: EmployeeScheduleRow[],
    originalShifts: Shift[]
): Shift[] {
    const shiftsMap = new Map<string, Shift>();

    originalShifts.forEach((shift) => {
        const key = `${shift.date}-${shift.shiftTypeId}`;
        shiftsMap.set(key, { ...shift, employees: [] });
    });

    rows.forEach((row) => {
        row.days.forEach((assignment, date) => {
            const key = `${date}-${assignment.shiftTypeId}`;
            let shift = shiftsMap.get(key);

            if (!shift) {
                shift = {
                    id: assignment.shiftId,
                    date,
                    shiftTypeId: assignment.shiftTypeId,
                    shiftTypeName: assignment.shiftTypeName,
                    startTime: assignment.startTime,
                    endTime: assignment.endTime,
                    color: assignment.color,
                    employeeNeeded: 1,
                    employees: [],
                };
                shiftsMap.set(key, shift);
            }

            shift.employees.push({
                id: row.employeeId,
                name: row.employeeName
            });
        });
    });

    return Array.from(shiftsMap.values()).filter((shift) => shift.employees.length > 0);
}

function calculateShiftDuration(startTime: string, endTime: string): number {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    let duration = (endH * 60 + endM) - (startH * 60 + startM);
    if (duration < 0) duration += 24 * 60;

    return duration / 60;
}
