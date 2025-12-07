'use client'

import {useScheduleData} from "@/api";
import {useEffect, useState, useMemo} from "react";
import {DateData, EmployeeMeData, Shift} from "@/types";
import {getDaysInMonth} from "@/helpers/dateHelper";
import {useAuthStore} from "@/zustand/auth-state";
import ScheduleCalendar from "@/modules/ScheduleCalendar/ScheduleCalendar";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/shadcn/card";
import {Badge} from "@/components/ui/shadcn/badge";
import {Calendar, Clock, Users, StickyNote} from "lucide-react";
import {Separator} from "@/components/ui/shadcn/separator";

const today = new Date();

export default function EmployeePersonalPage() {
    const {user} = useAuthStore();
    const employeeUser = user as EmployeeMeData;

    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [daysOfMonth, setDaysOfMonth] = useState<DateData[]>(getDaysInMonth(today.getFullYear(), today.getMonth()));
    const [shiftsData, setShiftsData] = useState<Shift[]>([]);

    // Используем первую группу для получения расписания
    const primaryGroupId = employeeUser.groupIds?.[0];
    const {data: scheduleData, isLoading} = useScheduleData({
        groupId: primaryGroupId,
        month: currentMonth,
        year: currentYear,
        showOnlyConfirmed: false
    });

    useEffect(() => {
        const newDays = getDaysInMonth(currentYear, currentMonth);
        setDaysOfMonth(newDays);
    }, [currentMonth, currentYear]);

    useEffect(() => {
        if (scheduleData?.schedule) {
            // Фильтруем только смены текущего пользователя
            const myShifts = scheduleData.schedule.shifts.filter(shift =>
                shift.employees.some(emp => emp.id === employeeUser.id)
            );
            setShiftsData(myShifts);
        }
    }, [scheduleData, employeeUser.id]);

    const upcomingShifts = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return shiftsData
            .filter(s => {
                const shiftDate = new Date(s.date);
                shiftDate.setHours(0, 0, 0, 0);
                return shiftDate >= now;
            })
            .sort((a, b) => {
                const aTime = new Date(`${a.date}T${a.startTime}`).getTime();
                const bTime = new Date(`${b.date}T${b.startTime}`).getTime();
                return aTime - bTime;
            })
            .slice(0, 5); // Показываем следующие 5 смен
    }, [shiftsData]);

    // Получаем заметки для текущего сотрудника
    const getMyNote = (shift: Shift) => {
        const myAssignment = shift.employees.find(emp => emp.id === employeeUser.id);
        return myAssignment?.note;
    };

    // Получаем коллег на смене
    const getCoworkers = (shift: Shift) => {
        return shift.employees.filter(emp => emp.id !== employeeUser.id);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Обзор</h1>
                <p className="text-muted-foreground">
                    Ваши предстоящие смены и расписание
                </p>
            </div>

            {/* Upcoming Shifts Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Предстоящие смены
                    </CardTitle>
                    <CardDescription>
                        Ваши следующие {upcomingShifts.length} смены
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {upcomingShifts.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            Нет предстоящих смен
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {upcomingShifts.map((shift, index) => {
                                const myNote = getMyNote(shift);
                                const coworkers = getCoworkers(shift);
                                const shiftDate = new Date(shift.date);

                                return (
                                    <div key={shift.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: shift.color }}
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-lg">
                                                        {shift.shiftTypeName}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {shiftDate.toLocaleDateString('ru-RU', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            {index === 0 && (
                                                <Badge variant="default">Следующая</Badge>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">
                                                    {shift.startTime} - {shift.endTime}
                                                </span>
                                            </div>

                                            {coworkers.length > 0 && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        Коллеги: {coworkers.map(c => c.name).join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {myNote && (
                                            <>
                                                <Separator className="my-3" />
                                                <div className="flex items-start gap-2 text-sm bg-muted/50 p-3 rounded">
                                                    <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-medium text-xs text-muted-foreground mb-1">
                                                            Заметка:
                                                        </p>
                                                        <p>{myNote}</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Monthly Calendar */}
            <Card>
                <CardHeader>
                    <CardTitle>График работы на месяц</CardTitle>
                    <CardDescription>
                        Полное расписание смен с информацией о коллегах
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {scheduleData?.schedule && (
                        <ScheduleCalendar
                            shiftsData={scheduleData.schedule.shifts}
                            shiftTypes={scheduleData.shiftTypes || []}
                            employees={scheduleData.employees || []}
                            daysOfMonth={daysOfMonth}
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            setCurrentMonth={setCurrentMonth}
                            setCurrentYear={setCurrentYear}
                            isConfirmed={scheduleData.schedule.scheduleInfo.isConfirmed}
                            isEditable={false}
                            orgHolidays={scheduleData.schedule.organizationHolidays}
                            orgSchedule={scheduleData.schedule.organizationSchedule}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
