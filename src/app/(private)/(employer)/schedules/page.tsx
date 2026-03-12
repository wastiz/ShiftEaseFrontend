'use client'

import { useRouter } from 'next/navigation'
import EntityCheckResult from '@/components/features/schedules/EntityCheckResult'
import { useCheckEntities, useScheduleSummaries } from "@/hooks/api";
import Loader from "@/components/ui/Loader";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import Header from "@/components/ui/Header";
import { ScheduleItem } from "@/types";
import { Badge } from "@/components/ui/shadcn/badge";
import {
    CheckCircle2,
    X,
    Clock,
    CalendarDays,
    BarChart2,
    AlertTriangle,
    ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

function SeverityBadge({ severity }: { severity: string }) {
    const lower = severity.toLowerCase();
    if (lower === 'critical' || lower === 'high') {
        return (
            <Badge className="bg-red-100 text-red-800 border-red-200">
                {severity}
            </Badge>
        );
    }
    if (lower === 'medium' || lower === 'warning') {
        return (
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                {severity}
            </Badge>
        );
    }
    return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            {severity}
        </Badge>
    );
}

function ScheduleItemCard({
    item,
    confirmed,
    onEdit,
}: {
    item: ScheduleItem;
    confirmed: boolean;
    onEdit: (id: number) => void;
}) {
    const hasWarnings = item.warnings && item.warnings.length > 0;

    return (
        <Card className={`w-full border ${confirmed ? 'border-green-200' : 'border-amber-200'}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                        {item.month} {item.year}
                    </CardTitle>
                    <Badge
                        className={
                            confirmed
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                        }
                    >
                        {confirmed ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed</>
                        ) : (
                            'Unconfirmed'
                        )}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                        <BarChart2 className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="text-sm font-semibold">{item.coverage}</span>
                        <span className="text-xs text-muted-foreground">Coverage</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                        <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="text-sm font-semibold">{item.totalHours}h</span>
                        <span className="text-xs text-muted-foreground">Hours</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                        <CalendarDays className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="text-sm font-semibold">{item.totalShifts}</span>
                        <span className="text-xs text-muted-foreground">Shifts</span>
                    </div>
                </div>

                {/* Warnings */}
                {hasWarnings && (
                    <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {item.warnings.length} warning{item.warnings.length > 1 ? 's' : ''}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {item.warnings.slice(0, 3).map((w, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-1.5 text-xs border rounded-md px-2 py-1"
                                >
                                    <SeverityBadge severity={w.severity} />
                                    <span className="text-muted-foreground">{w.label}</span>
                                    <span className="font-medium">{w.assigned}/{w.required}</span>
                                </div>
                            ))}
                            {item.warnings.length > 3 && (
                                <span className="text-xs text-muted-foreground self-center">
                                    +{item.warnings.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter>
                <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => onEdit(item.id)}
                >
                    Manage <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function Schedules() {
    const router = useRouter()
    const t = useTranslations('employer.schedules')
    const [showSuccessCard, setShowSuccessCard] = useState(false)

    const { data: entities, isLoading: loadingEntities, error: entitiesError } = useCheckEntities()

    const hasAllEntities = !!(entities?.departments && entities?.employees && entities?.shiftTypes)

    const {
        data: scheduleSummary,
        isLoading: loadingScheduleSummaries,
        error: scheduleSummariesError,
    } = useScheduleSummaries(hasAllEntities)

    useEffect(() => {
        if (!hasAllEntities) return
        const timer = setTimeout(() => {
            setShowSuccessCard(false)
        }, 5000)
        return () => clearTimeout(timer)
    }, [hasAllEntities])

    const handleEditClick = (scheduleId: number) => {
        router.push(`/schedules/${scheduleId}`)
    }

    const handleGoToSchedule = () => {
        router.push("schedules/manage")
    }

    if (loadingEntities) return <Loader />
    if (entitiesError) return <div className="text-red-500">{`${entitiesError}`}</div>

    if (!hasAllEntities) {
        return <EntityCheckResult entities={entities} />
    }

    if (loadingScheduleSummaries) return <Loader />
    if (scheduleSummariesError) return <div className="text-red-500">{`${scheduleSummariesError}`}</div>

    const confirmed = scheduleSummary?.confirmedSchedules ?? [];
    const unconfirmed = scheduleSummary?.unconfirmedSchedules ?? [];
    const hasAny = confirmed.length > 0 || unconfirmed.length > 0;

    return (
        <>
            <Header title={t('title')}>
                <Button onClick={handleGoToSchedule}>
                    Управление общим графиком
                </Button>
            </Header>

            <main className="p-4 space-y-6">
                {showSuccessCard && (
                    <div className="transition-all duration-500 ease-in-out animate-in slide-in-from-top">
                        <Card className="border-green-200 relative">
                            <CardContent className="pt-6 pr-12">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <p className="font-medium">{t('allDataAvailable')}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8 text-green-700 hover:bg-green-100"
                                    onClick={() => setShowSuccessCard(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {!hasAny ? (
                    <p className="text-muted-foreground">{t('noSchedulesYet')}</p>
                ) : (
                    <>
                        {unconfirmed.length > 0 && (
                            <section className="space-y-3">
                                <h2 className="text-base font-semibold text-amber-700 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    {t('unconfirmedSchedules')} ({unconfirmed.length})
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {unconfirmed.map((item) => (
                                        <ScheduleItemCard
                                            key={item.id}
                                            item={item}
                                            confirmed={false}
                                            onEdit={handleEditClick}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {confirmed.length > 0 && (
                            <section className="space-y-3">
                                <h2 className="text-base font-semibold text-green-700 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {t('confirmedSchedules')} ({confirmed.length})
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {confirmed.map((item) => (
                                        <ScheduleItemCard
                                            key={item.id}
                                            item={item}
                                            confirmed={true}
                                            onEdit={handleEditClick}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </>
    )
}
