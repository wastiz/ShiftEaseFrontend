"use client";

import { useState } from "react";
import { TreePalm, Trash2, Pencil } from "lucide-react";
import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/shadcn/button";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import Loader from "@/components/ui/Loader";
import { MONTHS } from "@/helpers/dateHelper";
import { useGetEmployeesTimeOffs } from "@/hooks/api";
import { EmployeeTimeOff, TimeOffType } from "@/types/schedule";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeKeys } from "@/lib/api-keys";
import api from "@/lib/api";
import { toast } from "sonner";
import TimeOffDialog from "@/components/features/employees/TimeOffDialog";
import { AddVacationAsideForm } from "@/components/features/employees/AddVacationAsideForm";
import { AddSickLeaveAsideForm } from "@/components/features/employees/AddSickLeaveAsideForm";

function overlapsMonth(startDate: Date, endDate: Date, year: number, month: number): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    return start <= monthEnd && end >= monthStart;
}

function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TimeOffPage() {
    const year = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [editEmployee, setEditEmployee] = useState<{ id: number; name: string } | null>(null);
    const [vacationFormOpen, setVacationFormOpen] = useState(false);
    const [sickLeaveFormOpen, setSickLeaveFormOpen] = useState(false);

    const { data: timeOffs = [], isLoading } = useGetEmployeesTimeOffs({ year });
    const queryClient = useQueryClient();

    const handleVacationFormClose = (o: boolean) => {
        setVacationFormOpen(o);
        if (!o) queryClient.invalidateQueries({ queryKey: employeeKeys.timeOffs(year) });
    };

    const handleSickLeaveFormClose = (o: boolean) => {
        setSickLeaveFormOpen(o);
        if (!o) queryClient.invalidateQueries({ queryKey: employeeKeys.timeOffs(year) });
    };

    const deleteMutation = useMutation({
        mutationFn: async ({ id, employeeId, type }: { id: number; employeeId: number; type: TimeOffType }) => {
            if (type === TimeOffType.Vacation) await api.delete(`vacations/${employeeId}/${id}`);
            else if (type === TimeOffType.SickLeave) await api.delete(`sick-leaves/${employeeId}/${id}`);
            else await api.delete(`personal-days/${employeeId}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: employeeKeys.timeOffs(year) });
            toast.success("Deleted");
        },
        onError: () => toast.error("Delete failed"),
    });

    const monthData = MONTHS.map((monthName, monthIndex) => {
        const vacationCount = timeOffs.filter(
            (e) => e.type === TimeOffType.Vacation && overlapsMonth(e.startDate, e.endDate, year, monthIndex)
        ).length;
        const sickCount = timeOffs.filter(
            (e) => e.type === TimeOffType.SickLeave && overlapsMonth(e.startDate, e.endDate, year, monthIndex)
        ).length;
        const personalCount = timeOffs.filter(
            (e) => e.type === TimeOffType.PersonalDay && overlapsMonth(e.startDate, e.endDate, year, monthIndex)
        ).length;
        return { monthName, vacationCount, sickCount, personalCount };
    });

    const selectedMonthEntries = timeOffs.filter((e) =>
        overlapsMonth(e.startDate, e.endDate, year, selectedMonth)
    );
    const vacations = selectedMonthEntries.filter((e) => e.type === TimeOffType.Vacation);
    const sickLeaves = selectedMonthEntries.filter((e) => e.type === TimeOffType.SickLeave);
    const personalDays = selectedMonthEntries.filter((e) => e.type === TimeOffType.PersonalDay);

    return (
        <>
            <Header title={`Time Off — ${year}`}>
                <Button size="sm" variant="outline" onClick={() => setSickLeaveFormOpen(true)}>
                    + Добавить больничный
                </Button>
                <Button size="sm" onClick={() => setVacationFormOpen(true)}>
                    + Добавить отпуск
                </Button>
            </Header>

            <main className="p-6 space-y-6">
                {/* Legend */}
                <div className="flex gap-5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" />
                        Vacation
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-sm bg-red-500" />
                        Sick leave
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-sm bg-amber-500" />
                        Personal day
                    </span>
                </div>

                {isLoading ? (
                    <Loader />
                ) : (
                    <>
                        {/* Month grid */}
                        <div className="grid grid-cols-6 gap-3 lg:grid-cols-12">
                            {monthData.map(({ monthName, vacationCount, sickCount, personalCount }, idx) => {
                                const total = vacationCount + sickCount + personalCount;
                                const isCurrent = idx === currentMonth;
                                const isSelected = idx === selectedMonth;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedMonth(idx)}
                                        className={`
                                            flex flex-col items-center justify-between
                                            rounded-lg border p-2 cursor-pointer select-none
                                            transition-colors hover:border-foreground/40
                                            ${isSelected
                                                ? "border-primary ring-1 ring-primary bg-primary/5"
                                                : isCurrent
                                                ? "border-primary/60 bg-primary/5"
                                                : "border-border"}
                                            ${total === 0 ? "opacity-50" : ""}
                                        `}
                                    >
                                        <span className={`text-xs font-medium mb-2 ${isCurrent || isSelected ? "text-primary" : "text-muted-foreground"}`}>
                                            {monthName}
                                        </span>

                                        <div className="flex flex-col gap-1 w-full">
                                            {vacationCount > 0 && (
                                                <div className="flex items-center justify-between px-1 py-0.5 rounded bg-blue-500/15">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 ml-auto">
                                                        {vacationCount}
                                                    </span>
                                                </div>
                                            )}
                                            {sickCount > 0 && (
                                                <div className="flex items-center justify-between px-1 py-0.5 rounded bg-red-500/15">
                                                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 ml-auto">
                                                        {sickCount}
                                                    </span>
                                                </div>
                                            )}
                                            {personalCount > 0 && (
                                                <div className="flex items-center justify-between px-1 py-0.5 rounded bg-amber-500/15">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                                                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 ml-auto">
                                                        {personalCount}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Selected month detail */}
                        <div className="border rounded-xl p-5">
                            <h2 className="text-base font-semibold mb-4">
                                {MONTHS[selectedMonth]} {year}
                                {selectedMonthEntries.length === 0 && (
                                    <span className="ml-2 font-normal text-muted-foreground text-sm">— no time off scheduled</span>
                                )}
                            </h2>

                            {selectedMonthEntries.length > 0 && (
                                <div className="space-y-5">
                                    {vacations.length > 0 && (
                                        <TimeOffGroup
                                            label="Vacation"
                                            colorClass="blue"
                                            entries={vacations}
                                            onDelete={(e) => deleteMutation.mutate({ id: e.id, employeeId: e.employeeId, type: e.type })}
                                            onEdit={(e) => setEditEmployee({ id: e.employeeId, name: e.employeeName })}
                                            isPending={deleteMutation.isPending}
                                        />
                                    )}
                                    {sickLeaves.length > 0 && (
                                        <TimeOffGroup
                                            label="Sick leave"
                                            colorClass="red"
                                            entries={sickLeaves}
                                            onDelete={(e) => deleteMutation.mutate({ id: e.id, employeeId: e.employeeId, type: e.type })}
                                            onEdit={(e) => setEditEmployee({ id: e.employeeId, name: e.employeeName })}
                                            isPending={deleteMutation.isPending}
                                        />
                                    )}
                                    {personalDays.length > 0 && (
                                        <TimeOffGroup
                                            label="Personal day"
                                            colorClass="amber"
                                            entries={personalDays}
                                            onDelete={(e) => deleteMutation.mutate({ id: e.id, employeeId: e.employeeId, type: e.type })}
                                            onEdit={(e) => setEditEmployee({ id: e.employeeId, name: e.employeeName })}
                                            isPending={deleteMutation.isPending}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {editEmployee && (
                <TimeOffDialog
                    open
                    onOpenChange={(o) => { if (!o) setEditEmployee(null); }}
                    employeeId={editEmployee.id}
                    employeeName={editEmployee.name}
                />
            )}

            <AddVacationAsideForm open={vacationFormOpen} onOpenChange={handleVacationFormClose} />
            <AddSickLeaveAsideForm open={sickLeaveFormOpen} onOpenChange={handleSickLeaveFormClose} />
        </>
    );
}

type TimeOffGroupProps = {
    label: string;
    colorClass: "blue" | "red" | "amber";
    entries: EmployeeTimeOff[];
    onDelete: (entry: EmployeeTimeOff) => void;
    onEdit: (entry: EmployeeTimeOff) => void;
    isPending: boolean;
};

function TimeOffGroup({ label, colorClass, entries, onDelete, onEdit, isPending }: TimeOffGroupProps) {
    const dot: Record<string, string> = {
        blue: "bg-blue-500",
        red: "bg-red-500",
        amber: "bg-amber-500",
    };
    const text: Record<string, string> = {
        blue: "text-blue-600 dark:text-blue-400",
        red: "text-red-600 dark:text-red-400",
        amber: "text-amber-600 dark:text-amber-400",
    };
    const bg: Record<string, string> = {
        blue: "bg-blue-500/8",
        red: "bg-red-500/8",
        amber: "bg-amber-500/8",
    };

    return (
        <div>
            <p className={`text-xs font-semibold mb-2 ${text[colorClass]}`}>
                {label} ({entries.length})
            </p>
            <div className="space-y-1.5">
                {entries.map((entry) => {
                    const start = formatDate(entry.startDate);
                    const end = formatDate(entry.endDate);
                    const dateRange = start === end ? start : `${start} – ${end}`;

                    return (
                        <div
                            key={entry.id}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg border hover:bg-accent/50 text-sm ${bg[colorClass]}`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-2 h-2 rounded-full ${dot[colorClass]} flex-shrink-0`} />
                                <span className="font-medium truncate">{entry.employeeName}</span>
                                <span className="text-muted-foreground text-xs flex-shrink-0">{dateRange}</span>
                            </div>
                            <div className="flex items-center gap-0.5 ml-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => onEdit(entry)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => onDelete(entry)}
                                    disabled={isPending}
                                >
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
