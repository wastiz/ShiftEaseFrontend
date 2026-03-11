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
import Header from "@/components/ui/Header";
import Main from "@/components/ui/Main";
import Link from 'next/link';
import { useGetOrganizationData } from '@/hooks/api';
import { useTranslations } from 'next-intl';

export default function EmployerDashboard() {
    const t = useTranslations('dashboard');
    const tCommon = useTranslations('common');
    const tOrg = useTranslations('organization');
    const organizationId = localStorage.getItem('orgId');
    const { data, isLoading } = useGetOrganizationData(organizationId ?? undefined);
    const [selectedDepartment, setSelectedDepartment] = useState<number>(1);

    const departments = [
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
    if (data.shiftTypeCount === 0) missingSetup.push(t('shiftTypes'));
    if (data.departmentCount === 0) missingSetup.push(t('departments'));
    if (data.employeeCount === 0) missingSetup.push(tCommon('employees'));

    console.log(data)

    const allUnconfirmedSchedules = data.scheduleSummary?.unconfirmedSchedules ?? [];

    return (
        <>
            <Header title={t('title')}>
                <Button asChild disabled={data.departmentCount === 0}>
                    <Link href="/schedules">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('createSchedule')}
                    </Link>
                </Button>
            </Header>
            <Main>
                <div className="container mx-auto p-4 md:p-6 space-y-6">
                    {missingSetup.length > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {t('completeSetup', { items: missingSetup.join(', ') })}
                                <Link href="/settings" className="ml-2 underline font-medium">
                                    {t('goToSettings')}
                                </Link>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('totalEmployees')}
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.employeeCount}</div>
                                {data.employeeCount === 0 ? (
                                    <Button variant="link" className="h-auto p-0 text-xs" asChild>
                                        <Link href="/employees">
                                            {t('addEmployees')}
                                        </Link>
                                    </Button>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        {t('acrossDepartments', { count: data.departmentCount })}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('totalSchedules')}
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.scheduleCount}</div>
                                {data.scheduleCount === 0 ? (
                                    <Button variant="link" className="h-auto p-0 text-xs" asChild>
                                        <Link href="/schedules/create">
                                            {t('createSchedule')}
                                        </Link>
                                    </Button>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        {allUnconfirmedSchedules.length} {t('unconfirmed')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('departments')}
                                </CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.departmentCount}</div>
                                {data.departmentCount === 0 ? (
                                    <Button variant="link" className="h-auto p-0 text-xs" asChild>
                                        <Link href="/departments">
                                            {t('createDepartment')}
                                        </Link>
                                    </Button>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        {t('workDepartmentsConfigured')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('shiftTypes')}
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.shiftTypeCount}</div>
                                {data.shiftTypeCount === 0 ? (
                                    <Button variant="link" className="h-auto p-0 text-xs" asChild>
                                        <Link href="/shift-types">
                                            {t('configureShiftTypes')}
                                        </Link>
                                    </Button>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        {t('shiftTypesConfigured')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('unconfirmedSchedules')}</CardTitle>
                                <CardDescription>
                                    {t('schedulesThatNeedConfirmation')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {allUnconfirmedSchedules.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">{t('noUnconfirmedSchedules')}</p>
                                ) : (
                                    allUnconfirmedSchedules.map((schedule) => (
                                        <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">
                                                    {schedule.month} {schedule.year}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/schedules/${schedule.id}`}>
                                                    {tCommon('edit')}
                                                </Link>
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('quickActions')}</CardTitle>
                                <CardDescription>
                                    {t('commonTasksAndShortcuts')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/schedules/create">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {t('createNewSchedule')}
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/employees">
                                        <Users className="mr-2 h-4 w-4" />
                                        {t('manageEmployees')}
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/shift-types">
                                        <Clock className="mr-2 h-4 w-4" />
                                        {t('configureShiftTypes')}
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/reports">
                                        <FileText className="mr-2 h-4 w-4" />
                                        {t('viewReports')}
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        {t('organizationSettings')}
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('departmentSchedules')}</CardTitle>
                            <CardDescription>
                                {t('viewAndManageSchedules')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={selectedDepartment.toString()} onValueChange={(v) => setSelectedDepartment(Number(v))}>
                                <TabsList className="w-full justify-start">
                                    {departments.map((department) => (
                                        <TabsTrigger key={department.id} value={department.id.toString()}>
                                            {department.name}
                                            <Badge variant="secondary" className="ml-2">
                                                {department.employeeCount}
                                            </Badge>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {departments.map((department) => (
                                    <TabsContent key={department.id} value={department.id.toString()} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold">{department.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {department.employeeCount} {t('employees')}
                                                </p>
                                            </div>
                                            <Badge variant={
                                                department.scheduleStatus === 'confirmed' ? 'default' :
                                                    department.scheduleStatus === 'pending' ? 'secondary' : 'outline'
                                            }>
                                                {t(department.scheduleStatus as 'confirmed' | 'pending' | 'draft')}
                                            </Badge>
                                        </div>

                                        <div className="border rounded-lg p-4">
                                            <div className="grid grid-cols-7 gap-2 mb-4">
                                                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                                                    <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                                                        {tOrg(`days.${day}`)}
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
                                                <Link href={`/schedules/${department.id}`}>
                                                    {t('viewFullSchedule')}
                                                </Link>
                                            </Button>
                                            <Button asChild>
                                                <Link href={`/schedules/${department.id}/edit`}>
                                                    {t('editSchedule')}
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
                                    {t('averageWeeklyHours')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">38.5h</div>
                                <div className="flex items-center text-xs text-green-600 mt-1">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +2.5h {t('fromLastWeek')}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">
                                    {t('scheduleCoverage')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">95%</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('allShiftsAssigned')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">
                                    {t('upcomingTimeOff')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">3</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('requestsThisWeek')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Main>
        </>
    );
}
