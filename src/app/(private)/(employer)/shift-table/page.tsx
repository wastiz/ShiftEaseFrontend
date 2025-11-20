'use client';

import { useState } from 'react';
import {
    Users,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    Plus,
    FileText,
    Settings,
    TrendingUp,
    Building2,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import Header from "@/modules/Header";
import Main from "@/modules/Main";
import Link from 'next/link';
import { useGetOrganizationData } from '@/api';

export default function EmployerDashboard() {
    const organizationId = "1";
    const { data, isLoading } = useGetOrganizationData(organizationId, { enabled: !!organizationId });
    const [selectedGroup, setSelectedGroup] = useState<number>(1);

    const groups = [
        { id: 1, name: 'Morning Shift', employeeCount: 8, scheduleStatus: 'confirmed' },
        { id: 2, name: 'Evening Shift', employeeCount: 10, scheduleStatus: 'pending' },
        { id: 3, name: 'Night Shift', employeeCount: 6, scheduleStatus: 'draft' }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    const missingSetup = [];
    if (data.shiftTypeCount === 0) missingSetup.push('Shift Types');
    if (data.groupCount === 0) missingSetup.push('Groups');
    if (data.employeeCount === 0) missingSetup.push('Employees');

    const allUnconfirmedSchedules = data.scheduleSummaries.flatMap(summary =>
        summary.unconfirmedSchedules.map(schedule => ({
            id: schedule.id,
            groupName: summary.groupName,
            groupId: summary.groupId,
            month: schedule.month
        }))
    );

    return (
        <>
            <Header title="Dashboard">
                <Button asChild disabled={data.groupCount === 0}>
                    <Link href="/employer/schedules/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Schedule
                    </Link>
                </Button>
            </Header>
            <Main>
                <div className="container mx-auto p-4 md:p-6 space-y-6">
                    {missingSetup.length > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Complete setup: Missing {missingSetup.join(', ')}.
                                <Link href="/employer/settings" className="ml-2 underline font-medium">
                                    Go to Settings
                                </Link>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Employees
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.employeeCount}</div>
                                {data.employeeCount === 0 ? (
                                    <Button variant="link" className="h-auto p-0 text-xs" asChild>
                                        <Link href="/employer/employees">
                                            Add employees
                                        </Link>
                                    </Button>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Across {data.groupCount} groups
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Schedules
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.scheduleCount}</div>
                                {data.scheduleCount === 0 ? (
                                    <Button variant="link" className="h-auto p-0 text-xs" asChild>
                                        <Link href="/employer/schedules/create">
                                            Create schedule
                                        </Link>
                                    </Button>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        {allUnconfirmedSchedules.length} unconfirmed
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Groups
                                </CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.groupCount}</div>
                                {data.groupCount === 0 ? (
                                    <Button variant="link" className="h-auto p-0 text-xs" asChild>
                                        <Link href="/employer/groups">
                                            Create group
                                        </Link>
                                    </Button>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Work groups configured
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Shift Types
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.shiftTypeCount}</div>
                                {data.shiftTypeCount === 0 ? (
                                    <Button variant="link" className="h-auto p-0 text-xs" asChild>
                                        <Link href="/employer/shift-types">
                                            Configure shift types
                                        </Link>
                                    </Button>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Shift types configured
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Unconfirmed Schedules</CardTitle>
                                <CardDescription>
                                    Schedules that need confirmation
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {allUnconfirmedSchedules.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No unconfirmed schedules</p>
                                ) : (
                                    allUnconfirmedSchedules.map((schedule) => (
                                        <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">
                                                    {schedule.groupName} - {schedule.month}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/employer/schedules/${schedule.groupId}`}>
                                                    Edit
                                                </Link>
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>
                                    Common tasks and shortcuts
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/employer/schedules/create">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Create New Schedule
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/employer/employees">
                                        <Users className="mr-2 h-4 w-4" />
                                        Manage Employees
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/employer/shift-types">
                                        <Clock className="mr-2 h-4 w-4" />
                                        Configure Shift Types
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/employer/reports">
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Reports
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/employer/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Organization Settings
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Group Schedules</CardTitle>
                            <CardDescription>
                                View and manage schedules for each group
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={selectedGroup.toString()} onValueChange={(v) => setSelectedGroup(Number(v))}>
                                <TabsList className="w-full justify-start">
                                    {groups.map((group) => (
                                        <TabsTrigger key={group.id} value={group.id.toString()}>
                                            {group.name}
                                            <Badge variant="secondary" className="ml-2">
                                                {group.employeeCount}
                                            </Badge>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {groups.map((group) => (
                                    <TabsContent key={group.id} value={group.id.toString()} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold">{group.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {group.employeeCount} employees
                                                </p>
                                            </div>
                                            <Badge variant={
                                                group.scheduleStatus === 'confirmed' ? 'default' :
                                                    group.scheduleStatus === 'pending' ? 'secondary' : 'outline'
                                            }>
                                                {group.scheduleStatus}
                                            </Badge>
                                        </div>

                                        <div className="border rounded-lg p-4">
                                            <div className="grid grid-cols-7 gap-2 mb-4">
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                                    <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-7 gap-2">
                                                {Array.from({ length: 7 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="aspect-square border rounded-lg p-2 hover:bg-accent cursor-pointer transition-colors"
                                                    >
                                                        <div className="text-sm font-medium">{i + 1}</div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {i % 2 === 0 ? '08:00' : '16:00'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" asChild>
                                                <Link href={`/employer/schedules/${group.id}`}>
                                                    View Full Schedule
                                                </Link>
                                            </Button>
                                            <Button asChild>
                                                <Link href={`/employer/schedules/${group.id}/edit`}>
                                                    Edit Schedule
                                                </Link>
                                            </Button>
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">
                                    Average Weekly Hours
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">38.5h</div>
                                <div className="flex items-center text-xs text-green-600 mt-1">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +2.5h from last week
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">
                                    Schedule Coverage
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">95%</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    All shifts assigned
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">
                                    Upcoming Time Off
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">3</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Requests this week
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Main>
        </>
    );
}
