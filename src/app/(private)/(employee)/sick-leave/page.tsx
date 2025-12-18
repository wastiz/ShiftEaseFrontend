'use client';

import { useState } from 'react';
import { FileText, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/shadcn/dialog';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { useSickLeaves } from '@/api';
import { SickLeaveDto } from "@/types";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Header from "@/modules/Header";
import Main from "@/modules/Main";

export default function SickLeavePage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');

    const { data: sickLeaves, isLoading } = useSickLeaves();
    const addSickLeave = useAddSickLeave();
    const deleteSickLeave = useDeleteSickLeave();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await addSickLeave.mutateAsync({
                startDate,
                endDate,
                diagnosis,
                documentNumber,
            });

            toast.success('Sick leave added successfully');

            setIsDialogOpen(false);
            setStartDate('');
            setEndDate('');
            setDiagnosis('');
            setDocumentNumber('');
        } catch (error) {
            toast.error('Failed to add sick leave');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this sick leave?')) return;

        try {
            await deleteSickLeave.mutateAsync(id);
            toast.success('Sick leave deleted successfully');
        } catch (error) {
            toast.error('Failed to delete sick leave');
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
            <Header title={"Sick Leaves"}>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="md:size-default">
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Add New</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>New Sick Leave</DialogTitle>
                                <DialogDescription>
                                    Fill in the sick leave information
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
                                    <Label htmlFor="documentNumber">Document Number</Label>
                                    <Input
                                        id="documentNumber"
                                        placeholder="e.g., 123456789012"
                                        value={documentNumber}
                                        onChange={(e) => setDocumentNumber(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="diagnosis">Diagnosis (optional)</Label>
                                    <Textarea
                                        id="diagnosis"
                                        placeholder="Brief description..."
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={addSickLeave.isPending}>
                                    {addSickLeave.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    )}
                                    Add Sick Leave
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
                                    Manage your sick leave documents
                                </p>
                            </div>
                        </div>

                        <Alert>
                            <AlertCircle className="h-4 w-4"/>
                            <AlertDescription>
                                Sick leave documents must be provided within 3 days
                            </AlertDescription>
                        </Alert>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        {sickLeaves && sickLeaves.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-10">
                                    <FileText className="h-12 w-12 text-muted-foreground mb-4"/>
                                    <p className="text-muted-foreground text-center">
                                        You don't have any sick leaves yet
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            sickLeaves?.map((sickLeave) => (
                                <Card key={sickLeave.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <CardTitle
                                                    className="text-lg md:text-xl flex items-center gap-2 flex-wrap">
                                                    <FileText className="h-5 w-5 flex-shrink-0"/>
                                                    <span className="truncate">
                                                {format(new Date(sickLeave.startDate), 'MMM d', {locale: enUS})}
                                                        {' — '}
                                                        {format(new Date(sickLeave.endDate), 'MMM d, yyyy', {locale: enUS})}
                                            </span>
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {Math.ceil(
                                                        (new Date(sickLeave.endDate).getTime() -
                                                            new Date(sickLeave.startDate).getTime()) /
                                                        (1000 * 60 * 60 * 24)
                                                    )}{' '}
                                                    days
                                                </CardDescription>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => sickLeave.id && handleDelete(sickLeave.id)}
                                                disabled={deleteSickLeave.isPending}
                                                className="flex-shrink-0"
                                            >
                                                {deleteSickLeave.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                                ) : (
                                                    <Trash2 className="h-4 w-4"/>
                                                )}
                                            </Button>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-2">
                                        {sickLeave.documentNumber && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">Document:</span>
                                                <span className="font-mono">{sickLeave.documentNumber}</span>
                                            </div>
                                        )}

                                        {sickLeave.diagnosis && (
                                            <p className="text-sm text-muted-foreground">
                                                {sickLeave.diagnosis}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </Main>
        </>
    );
}
