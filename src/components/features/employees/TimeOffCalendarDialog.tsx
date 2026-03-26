"use client";

import { BarChart2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";
import { MONTHS } from "@/helpers/dateHelper";
import { useGetEmployeesTimeOffs } from "@/hooks/api";
import { TimeOffType } from "@/types/schedule";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function overlapsMonth(startDate: Date, endDate: Date, year: number, month: number): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    return start <= monthEnd && end >= monthStart;
}

export function TimeOffCalendarDialog({ open, onOpenChange }: Props) {
    const year = new Date().getFullYear();

    const { data: timeOffs = [], isLoading } = useGetEmployeesTimeOffs({ year }, open);

    const monthData = MONTHS.map((monthName, monthIndex) => {
        const vacationEmployees: string[] = [];
        const sickEmployees: string[] = [];
        const personalEmployees: string[] = [];

        timeOffs.forEach((entry) => {
            if (!overlapsMonth(entry.startDate, entry.endDate, year, monthIndex)) return;

            if (entry.type === TimeOffType.Vacation) vacationEmployees.push(entry.employeeName);
            else if (entry.type === TimeOffType.SickLeave) sickEmployees.push(entry.employeeName);
            else if (entry.type === TimeOffType.PersonalDay) personalEmployees.push(entry.employeeName);
        });

        return { monthName, vacationEmployees, sickEmployees, personalEmployees };
    });

    const currentMonth = new Date().getMonth();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-none w-[calc(240w+2rem)]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" />
                        Time Off Schedule — {year}
                    </DialogTitle>
                </DialogHeader>

                {/* Legend */}
                <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" />
                        Vacation
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-sm bg-red-500" />
                        Sick leave
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-sm bg-amber-500" />
                        Personal day
                    </span>
                </div>

                {isLoading ? (
                    <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                        Loading...
                    </div>
                ) : (
                    <TooltipProvider delayDuration={150}>
                        <div className="flex flex-row gap-2">
                            {monthData.map(({ monthName, vacationEmployees, sickEmployees, personalEmployees }, idx) => {
                                const total =
                                    vacationEmployees.length + sickEmployees.length + personalEmployees.length;
                                const isCurrent = idx === currentMonth;
                                const isEmpty = total === 0;

                                const tooltipContent = (
                                    <div className="space-y-2 max-w-xs text-xs">
                                        {vacationEmployees.length > 0 && (
                                            <div>
                                                <p className="font-semibold text-blue-400 mb-1">Vacation ({vacationEmployees.length})</p>
                                                {vacationEmployees.map((name) => (
                                                    <p key={name}>{name}</p>
                                                ))}
                                            </div>
                                        )}
                                        {sickEmployees.length > 0 && (
                                            <div>
                                                <p className="font-semibold text-red-400 mb-1">Sick leave ({sickEmployees.length})</p>
                                                {sickEmployees.map((name) => (
                                                    <p key={name}>{name}</p>
                                                ))}
                                            </div>
                                        )}
                                        {personalEmployees.length > 0 && (
                                            <div>
                                                <p className="font-semibold text-amber-400 mb-1">Personal day ({personalEmployees.length})</p>
                                                {personalEmployees.map((name) => (
                                                    <p key={name}>{name}</p>
                                                ))}
                                            </div>
                                        )}
                                        {isEmpty && (
                                            <p className="text-muted-foreground">No time off scheduled</p>
                                        )}
                                    </div>
                                );

                                return (
                                    <Tooltip key={idx}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={`
                                                    w-20 relative flex flex-col items-center justify-between
                                                    rounded-lg border p-2 cursor-default select-none
                                                    transition-colors hover:border-foreground/40
                                                    ${isCurrent ? "border-primary/60 bg-primary/5" : "border-border"}
                                                    ${isEmpty ? "opacity-60" : ""}
                                                `}
                                                style={{ minHeight: "100px" }}
                                            >
                                                <span className={`text-xs font-medium mb-2 ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                                                    {monthName}
                                                </span>

                                                <div className="flex flex-col gap-1 w-full">
                                                    {vacationEmployees.length > 0 && (
                                                        <div className="flex items-center justify-between px-1 py-0.5 rounded bg-blue-500/15">
                                                            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 ml-auto">
                                                                {vacationEmployees.length}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {sickEmployees.length > 0 && (
                                                        <div className="flex items-center justify-between px-1 py-0.5 rounded bg-red-500/15">
                                                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                                            <span className="text-xs font-semibold text-red-600 dark:text-red-400 ml-auto">
                                                                {sickEmployees.length}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {personalEmployees.length > 0 && (
                                                        <div className="flex items-center justify-between px-1 py-0.5 rounded bg-amber-500/15">
                                                            <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                                                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 ml-auto">
                                                                {personalEmployees.length}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="p-3">
                                            <p className="font-semibold mb-2">{monthName} {year}</p>
                                            {tooltipContent}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </TooltipProvider>
                )}
            </DialogContent>
        </Dialog>
    );
}
