'use client'

import ScheduleCalendar from "@/modules/ScheduleCalendar/ScheduleCalendar";
import {useGetEmployeeSchedule} from "@/api";
import {useEffect, useState, useMemo} from "react";
import {DateData, Shift} from "@/types";
import {getDaysInMonth} from "@/helpers/dateHelper";

const today = new Date();

export default function EmployeePersonalPage() {

    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [daysOfMonth, setDaysOfMonth] = useState<DateData[]>(getDaysInMonth(today.getFullYear(), today.getMonth()));
    const [shiftsData, setShiftsData] = useState<Shift[]>([]);

    const {data: scheduleData, isLoading} = useGetEmployeeSchedule(currentMonth, currentYear);

    useEffect(() => {
        if (scheduleData?.scheduleInfoWithShifts) {
            setShiftsData(scheduleData.scheduleInfoWithShifts.shifts || []);
        }
    }, [scheduleData]);

    const nextShift = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingShifts = shiftsData
            .filter(s => {
                const shiftDate = new Date(s.date);
                shiftDate.setHours(0, 0, 0, 0);

                return shiftDate > today;
            })
            .sort((a, b) => {
                const aTime = new Date(`${a.date}T${a.from}`).getTime();
                const bTime = new Date(`${b.date}T${b.from}`).getTime();
                return aTime - bTime;
            });

        return upcomingShifts[0];
    }, [shiftsData]);

    console.log(shiftsData)

    return (
        <div className="flex flex-col gap-4">
            {nextShift && (
                <div className="p-4 bg-primary/20 rounded border">
                    <p className="font-medium text-lg">Next Shift:</p>
                    <p>
                        {nextShift.shiftTypeName} — {nextShift.from} to {nextShift.to} on {nextShift.date}
                    </p>
                </div>
            )}

            <ScheduleCalendar
                shiftsData={shiftsData}
                setShiftsData={setShiftsData}
                daysOfMonth={daysOfMonth}
                isEditable={false}
            />
        </div>
    );
}
