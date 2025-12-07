'use client';

import { useState } from 'react';
import { Calendar, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/shadcn/dialog';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { Badge } from '@/components/ui/shadcn/badge';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import {
    useEmployeeVacations,
    useEmployeeVacationRequests,
    useAddEmployeeVacationRequest,
    useDeleteEmployeeVacation,
    useDeleteEmployeeVacationRequest
} from '@/api';
import { EmployeeMeData } from '@/types';
import { useAuthStore } from '@/zustand/auth-state';
import { toast } from "sonner";
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Header from "@/modules/Header";
import Main from "@/modules/Main";

export default function VacationPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const { user } = useAuthStore();
    const employeeUser = user as EmployeeMeData;
    const employeeId = employeeUser.id;

    const { data: approvedVacations, isLoading: isLoadingApproved } = useEmployeeVacations(employeeId);
    const { data: vacationRequests, isLoading: isLoadingRequests } = useEmployeeVacationRequests(employeeId);
    const addVacationRequest = useAddEmployeeVacationRequest(employeeId);
    const deleteApprovedVacation = useDeleteEmployeeVacation(employeeId);
    const deleteVacationRequest = useDeleteEmployeeVacationRequest(employeeId);

    const isLoading = isLoadingApproved || isLoadingRequests;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await addVacationRequest.mutateAsync({
                startDate,
                endDate,
                reason,
            });

            toast.success('Vacation request submitted successfully');

            setIsDialogOpen(false);
            setStartDate('');
            setEndDate('');
            setReason('');
        } catch (error) {
            toast.error('Failed to submit vacation request');
        }
    };

    const handleDeleteRequest = async (id: number) => {
        if (!confirm('Are you sure you want to delete this request?')) return;

        try {
            await deleteVacationRequest.mutateAsync(id);
            toast.success('Request deleted successfully');
        } catch (error) {
            toast.error('Failed to delete request');
        }
    };

    const handleDeleteApproved = async (id: number) => {
        if (!confirm('Are you sure you want to delete this vacation?')) return;

        try {
            await deleteApprovedVacation.mutateAsync(id);
            toast.success('Vacation deleted successfully');
        } catch (error) {
            toast.error('Failed to delete vacation');
        }
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500">Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary">Pending</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Header title={"Vacations"}>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="md:size-default">
                            <Plus className="h-4 w-4 mr-2"/>
                            <span className="hidden sm:inline">Add New</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>New Vacation Request</DialogTitle>
                                <DialogDescription>
                                    Fill in the vacation dates and reason
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startDate">Start Date *</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="endDate">End Date *</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="reason">Reason (optional)</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Specify the reason for vacation..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={addVacationRequest.isPending}>
                                    {addVacationRequest.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    )}
                                    Submit Request
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </Header>
            <Main>
                <div className="container max-w-4xl mx-auto p-4 pb-20 md:p-6">
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm md:text-base">
                                    Manage your vacation requests
                                </p>
                            </div>
                        </div>

                        <Alert>
                            <AlertCircle className="h-4 w-4"/>
                            <AlertDescription>
                                Vacation requests must be submitted at least 2 weeks in advance
                            </AlertDescription>
                        </Alert>
                    </div>

                    <Tabs defaultValue="requests" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="requests">Pending Requests</TabsTrigger>
                            <TabsTrigger value="approved">Approved</TabsTrigger>
                        </TabsList>

                        <TabsContent value="requests" className="space-y-4 mt-6">
                            {vacationRequests && vacationRequests.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-10">
                                        <Calendar className="h-12 w-12 text-muted-foreground mb-4"/>
                                        <p className="text-muted-foreground text-center">
                                            You don't have any pending vacation requests
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                vacationRequests?.map((vacation) => (
                                    <Card key={vacation.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg md:text-xl flex items-center gap-2 flex-wrap">
                                                        <Calendar className="h-5 w-5 flex-shrink-0"/>
                                                        <span className="truncate">
                                                            {format(new Date(vacation.startDate), 'MMM d', {locale: enUS})}
                                                            {' — '}
                                                            {format(new Date(vacation.endDate), 'MMM d, yyyy', {locale: enUS})}
                                                        </span>
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {Math.ceil(
                                                            (new Date(vacation.endDate).getTime() -
                                                                new Date(vacation.startDate).getTime()) /
                                                            (1000 * 60 * 60 * 24)
                                                        )}{' '}
                                                        days
                                                    </CardDescription>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => vacation.id && handleDeleteRequest(vacation.id)}
                                                    disabled={deleteVacationRequest.isPending}
                                                    className="flex-shrink-0"
                                                >
                                                    {deleteVacationRequest.isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                                    ) : (
                                                        <Trash2 className="h-4 w-4"/>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(vacation.status)}
                                            </div>

                                            {vacation.reason && (
                                                <p className="text-sm text-muted-foreground">
                                                    {vacation.reason}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="approved" className="space-y-4 mt-6">
                            {approvedVacations && approvedVacations.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-10">
                                        <Calendar className="h-12 w-12 text-muted-foreground mb-4"/>
                                        <p className="text-muted-foreground text-center">
                                            You don't have any approved vacations
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                approvedVacations?.map((vacation) => (
                                    <Card key={vacation.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg md:text-xl flex items-center gap-2 flex-wrap">
                                                        <Calendar className="h-5 w-5 flex-shrink-0"/>
                                                        <span className="truncate">
                                                            {format(new Date(vacation.startDate), 'MMM d', {locale: enUS})}
                                                            {' — '}
                                                            {format(new Date(vacation.endDate), 'MMM d, yyyy', {locale: enUS})}
                                                        </span>
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {Math.ceil(
                                                            (new Date(vacation.endDate).getTime() -
                                                                new Date(vacation.startDate).getTime()) /
                                                            (1000 * 60 * 60 * 24)
                                                        )}{' '}
                                                        days
                                                    </CardDescription>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => vacation.id && handleDeleteApproved(vacation.id)}
                                                    disabled={deleteApprovedVacation.isPending}
                                                    className="flex-shrink-0"
                                                >
                                                    {deleteApprovedVacation.isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                                    ) : (
                                                        <Trash2 className="h-4 w-4"/>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-2">
                                            <Badge className="bg-green-500">Approved</Badge>

                                            {vacation.reason && (
                                                <p className="text-sm text-muted-foreground">
                                                    {vacation.reason}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </Main>
        </>
    );
}
