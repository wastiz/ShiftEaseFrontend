'use client'

import { useRouter } from 'next/navigation'
import EntityCheckResult from '@/components/features/schedules/EntityCheckResult'
import {useCheckEntities, useScheduleSummaries} from "@/hooks/api";
import Loader from "@/components/ui/Loader";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/shadcn/card";
import {Button} from "@/components/ui/shadcn/button";
import Header from "@/components/ui/Header";
import api from "@/lib/api";
import {ScheduleSummary} from "@/types";
import { Badge } from "@/components/ui/shadcn/badge";
import { CheckCircle2, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Schedules() {
    const router = useRouter()
    const [showSuccessCard, setShowSuccessCard] = useState(false)

    const { data: entities, isLoading: loadingEntities, error: entitiesError } = useCheckEntities()

    const hasAllEntities = !!(entities?.groups && entities?.employees && entities?.shiftTypes)

    const { data: scheduleSummaries, isLoading: loadingScheduleSummaries, error: scheduleSummariesError } = useScheduleSummaries(hasAllEntities)


    useEffect(() => {
        if (!hasAllEntities) return

        const timer = setTimeout(() => {
            setShowSuccessCard(false)
        }, 5000)

        return () => clearTimeout(timer)
    }, [hasAllEntities])

    const handleEditClick = (groupId: number) => {
        router.push(`/schedules/${groupId}`)
    }

    if (loadingEntities) return <Loader />
    if (entitiesError) return <div className="text-red-500">{`${entitiesError}`}</div>

    if (!hasAllEntities) {
        return <EntityCheckResult entities={entities} />
    }

    if (loadingScheduleSummaries) return <Loader />
    if (scheduleSummariesError) return <div className="text-red-500">{`${scheduleSummariesError}`}</div>

    return (
        <>
            <Header title={"Schedules"}></Header>
            <main className="p-4 space-y-6">
                {showSuccessCard && (
                    <div className="transition-all duration-500 ease-in-out animate-in slide-in-from-top">
                        <Card className="border-green-200 relative">
                            <CardContent className="pt-6 pr-12">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <p className="font-medium">
                                        All required data is available. You can create schedules for your groups.
                                    </p>
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

                <div className="grid gap-4">
                    {scheduleSummaries.map((schedule: ScheduleSummary) => {
                            const hasSchedules = schedule.unconfirmedSchedules.length > 0 || schedule.confirmedSchedules.length > 0

                            return (
                                <Card className="w-full" key={schedule.groupId}>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold">{schedule.groupName}</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {hasSchedules ? (
                                            <>
                                                {schedule.confirmedSchedules.length > 0 && (
                                                    <div>
                                                        <p className="font-medium mb-2">Confirmed schedules:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {schedule.confirmedSchedules.map((item) => (
                                                                <Badge
                                                                    key={item.id}
                                                                    variant="secondary"
                                                                    className="bg-green-100 text-green-800 border-green-200"
                                                                >
                                                                    {item.month}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {schedule.unconfirmedSchedules.length > 0 && (
                                                    <div>
                                                        <p className="font-medium mb-2">Unconfirmed schedules:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {schedule.unconfirmedSchedules.map((item) => (
                                                                <Badge
                                                                    key={item.id}
                                                                    variant="outline"
                                                                    className="border-amber-300 text-amber-800"
                                                                >
                                                                    {item.month}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground">
                                                No schedules yet for this group. Create the first one to get started.
                                            </p>
                                        )}
                                    </CardContent>

                                    <CardFooter>
                                        <Button onClick={() => handleEditClick(schedule.groupId)}>
                                            Manage Schedules
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })
                    }
                </div>
            </main>
        </>
    )
}
