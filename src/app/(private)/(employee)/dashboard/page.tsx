'use client'

import ScheduleCalendar from "@/modules/ScheduleCalendar/ScheduleCalendar";
import {useGetConfirmedSchedule} from "@/api";
import {useEffect, useState, useMemo} from "react";
import {DateData, Shift} from "@/types";
import {getDaysInMonth} from "@/helpers/dateHelper";
import {useAuthStore} from "@/zustand/auth-state";

const today = new Date();

export default function EmployeePersonalPage() {

    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [daysOfMonth, setDaysOfMonth] = useState<DateData[]>(getDaysInMonth(today.getFullYear(), today.getMonth()));
    const [shiftsData, setShiftsData] = useState<Shift[]>([]);
    const user = useAuthStore((state) => state.user);

    const {data: scheduleData, isLoading} = useGetConfirmedSchedule(currentMonth, currentYear, user.userData.groupId);

    console.log(scheduleData);

    useEffect(() => {
        if (scheduleData) {
            setShiftsData(scheduleData.shifts || []);
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
                const aTime = new Date(`${a.date}T${a.startTime}`).getTime();
                const bTime = new Date(`${b.date}T${b.endTime}`).getTime();
                return aTime - bTime;
            });

        return upcomingShifts[0];
    }, [shiftsData]);

    return (
        <div className="flex flex-col gap-4">
            {nextShift && (
                <div className="p-4 bg-primary/20 rounded border">
                    <p className="font-medium text-lg">Next Shift:</p>
                    <p>
                        {nextShift.shiftTypeName} — {nextShift.startTime} to {nextShift.endTime} on {nextShift.date}
                    </p>
                </div>
            )}

            {/*<ScheduleCalendar*/}
            {/*    shiftsData={shiftsData}*/}
            {/*    setShiftsData={setShiftsData}*/}
            {/*    shiftTypes={scheduleData?.shiftTypes || []}*/}
            {/*    employees={scheduleData?.employees || []}*/}
            {/*    daysOfMonth={daysOfMonth}*/}
            {/*    currentMonth={currentMonth}*/}
            {/*    currentYear={currentYear}*/}
            {/*    setCurrentMonth={setCurrentMonth}*/}
            {/*    setCurrentYear={setCurrentYear}*/}
            {/*    isConfirmed={true}*/}
            {/*    isEditable={false}*/}
            {/*    orgHolidays={scheduleData.organizationHolidays}*/}
            {/*    orgSchedule={scheduleData.organizationSchedule}*/}
            {/*/>*/}
        </div>
    );
}
