'use client'

import { useRouter } from 'next/navigation'
import EntityCheckResult from '@/components/EntityCheckResult'
import {useCheckEntities, useScheduleSummaries} from "@/api";
import Loader from "@/components/ui/Loader";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/shadcn/card";
import {Button} from "@/components/ui/shadcn/button";
import Header from "@/modules/Header";
import api from "@/lib/api";

export default function Schedules() {
    const router = useRouter()

    const { data: entities, isLoading: loadingEntities, error: entitiesError } = useCheckEntities()
    const { data: schedules, isLoading: loadingSchedules, error: schedulesError } = useScheduleSummaries(
        !!(entities?.groups && entities?.employees && entities?.shiftTypes)
    )

    const handleEditClick = (groupId: string) => {
        router.push(`/schedules/${groupId}`)
    }

    const handleCreateClick = async (groupId: string) => {
        try {
            const response = await api.post(`schedules/create-empty-schedule/${groupId}`);

            if (response.data.success) {
                router.push(`/schedules/${groupId}`)
            } else {
                console.log('Failed to create empty schedule:', response.data.message)
            }
        } catch (error) {
            console.error('Error creating empty schedule:', error)
        }
    }

    if (loadingEntities || loadingSchedules) return <Loader />
    if (entitiesError) return <div className="text-red-500">{`${entitiesError}`}</div>
    if (!entities?.groups || !entities?.employees || !entities?.shiftTypes) {
        return <EntityCheckResult entities={entities || {}} />
    }
    if (schedulesError) return <div className="text-red-500">{`${schedulesError}`}</div>

    return (
        <>
            <Header title={"Schedules"}></Header>
            <main className="p-4">
                <div className="grid gap-4">
                    {schedules && schedules.length > 0 ? (
                        schedules.map((schedule: any) => {
                            const hasSchedules = schedule.unconfirmedMonths.length > 0 || schedule.confirmedMonths.length > 0
                            return (
                                <Card className="w-full" key={schedule.groupId}>
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold">{schedule.groupName}</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-2 text-sm">
                                        {hasSchedules ? (
                                            <>
                                                <div>
                                                    <strong>Shifts confirmed for:</strong>{' '}
                                                    {schedule.confirmedMonths.length > 0 ? schedule.confirmedMonths.join(', ') : '—'}
                                                </div>
                                                <div>
                                                    <strong>Not confirmed for:</strong>{' '}
                                                    {schedule.unconfirmedMonths.length > 0 ? schedule.unconfirmedMonths.join(', ') : '—'}
                                                </div>
                                                <div>
                                                    <strong>Autorenewal:</strong> {schedule.autorenewal ? 'Yes' : 'No'}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="font-medium">
                                                This group does not have any schedules, please create one.
                                            </p>
                                        )}
                                    </CardContent>

                                    <CardFooter>
                                        {hasSchedules ? (
                                            <Button onClick={() => handleEditClick(schedule.groupId)}>
                                                Manage
                                            </Button>
                                        ) : (
                                            <Button onClick={() => handleCreateClick(schedule.groupId)}>
                                                Create
                                            </Button>
                                        )}

                                    </CardFooter>
                                </Card>
                            )
                        })
                    ) : (
                        <p>No schedules found</p>
                    )}
                </div>
            </main>
        </>
    )
}
