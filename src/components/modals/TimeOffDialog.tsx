"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import FormField from "@/components/FormField";
import {
    useAddApprovedVacation,
    useAddApprovedSickLeave,
    useAddApprovedPersonalDay,
    useGetVacations,
    useGetSickLeaves,
    useGetPersonalDays,
    useGetDeleteVacation,
    useGetDeleteSickLeave,
    useGetDeletePersonalDay,
} from "@/api/employee-options";
import { VacationDto, SickLeaveDto, PersonalDayDto } from "@/types";
import { Calendar, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/shadcn/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";

type TimeOffDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: number;
    employeeName: string;
};

export default function TimeOffDialog({
    open,
    onOpenChange,
    employeeId,
    employeeName,
}: TimeOffDialogProps) {
    const [activeTab, setActiveTab] = useState<"vacation" | "sick" | "personal">("vacation");
    const [viewMode, setViewMode] = useState<"add" | "view">("add");

    const addVacationMutation = useAddApprovedVacation(employeeId);
    const addSickLeaveMutation = useAddApprovedSickLeave(employeeId);
    const addPersonalDayMutation = useAddApprovedPersonalDay(employeeId);

    const { data: vacations = [], isLoading: vacationsLoading } = useGetVacations(employeeId);
    const { data: sickLeaves = [], isLoading: sickLeavesLoading } = useGetSickLeaves(employeeId);
    const { data: personalDays = [], isLoading: personalDaysLoading } = useGetPersonalDays(employeeId);

    const deleteVacationMutation = useGetDeleteVacation(employeeId);
    const deleteSickLeaveMutation = useGetDeleteSickLeave(employeeId);
    const deletePersonalDayMutation = useGetDeletePersonalDay(employeeId);

    const {
        register: registerVacation,
        handleSubmit: handleSubmitVacation,
        reset: resetVacation,
        formState: { errors: vacationErrors },
    } = useForm<VacationDto>();

    const {
        register: registerSick,
        handleSubmit: handleSubmitSick,
        reset: resetSick,
        formState: { errors: sickErrors },
    } = useForm<SickLeaveDto>();

    const {
        register: registerPersonal,
        handleSubmit: handleSubmitPersonal,
        reset: resetPersonal,
        formState: { errors: personalErrors },
    } = useForm<PersonalDayDto>();

    const onSubmitVacation = (data: VacationDto) => {
        addVacationMutation.mutate(data, {
            onSuccess: () => {
                toast.success("Vacation added successfully!");
                resetVacation();
                setViewMode("view");
            },
            onError: () => {
                toast.error("Failed to add vacation");
            },
        });
    };

    const onSubmitSick = (data: SickLeaveDto) => {
        addSickLeaveMutation.mutate(data, {
            onSuccess: () => {
                toast.success("Sick leave added successfully!");
                resetSick();
                setViewMode("view");
            },
            onError: () => {
                toast.error("Failed to add sick leave");
            },
        });
    };

    const onSubmitPersonal = (data: PersonalDayDto) => {
        addPersonalDayMutation.mutate(data, {
            onSuccess: () => {
                toast.success("Personal day added successfully!");
                resetPersonal();
                setViewMode("view");
            },
            onError: () => {
                toast.error("Failed to add personal day");
            },
        });
    };

    const handleDelete = (id: number, type: "vacation" | "sick" | "personal") => {
        if (type === "vacation") {
            deleteVacationMutation.mutate(id, {
                onSuccess: () => toast.success("Vacation deleted"),
                onError: () => toast.error("Failed to delete vacation"),
            });
        } else if (type === "sick") {
            deleteSickLeaveMutation.mutate(id, {
                onSuccess: () => toast.success("Sick leave deleted"),
                onError: () => toast.error("Failed to delete sick leave"),
            });
        } else {
            deletePersonalDayMutation.mutate(id, {
                onSuccess: () => toast.success("Personal day deleted"),
                onError: () => toast.error("Failed to delete personal day"),
            });
        }
    };

    const handleClose = () => {
        resetVacation();
        resetSick();
        resetPersonal();
        setViewMode("add");
        onOpenChange(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Manage Time Off - {employeeName}</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 mb-4">
                    <Button
                        variant={viewMode === "add" ? "default" : "outline"}
                        onClick={() => setViewMode("add")}
                        size="sm"
                    >
                        Add Time Off
                    </Button>
                    <Button
                        variant={viewMode === "view" ? "default" : "outline"}
                        onClick={() => setViewMode("view")}
                        size="sm"
                    >
                        View Current Time Off
                    </Button>
                </div>

                {viewMode === "add" ? (
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v )}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="vacation">Vacation</TabsTrigger>
                            <TabsTrigger value="sick">Sick Leave</TabsTrigger>
                            <TabsTrigger value="personal">Personal Day</TabsTrigger>
                        </TabsList>

                        <TabsContent value="vacation">
                            <form
                                id="vacation-form"
                                onSubmit={handleSubmitVacation(onSubmitVacation)}
                                className="space-y-4 mt-4"
                            >
                                <FormField>
                                    <Label htmlFor="vacation-startDate">
                                        Start Date
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="vacation-startDate"
                                        type="date"
                                        {...registerVacation("startDate", {
                                            required: "Start date is required",
                                        })}
                                    />
                                    {vacationErrors.startDate && (
                                        <p className="text-red-500 text-sm">
                                            {vacationErrors.startDate.message}
                                        </p>
                                    )}
                                </FormField>

                                <FormField>
                                    <Label htmlFor="vacation-endDate">
                                        End Date
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="vacation-endDate"
                                        type="date"
                                        {...registerVacation("endDate", {
                                            required: "End date is required",
                                        })}
                                    />
                                    {vacationErrors.endDate && (
                                        <p className="text-red-500 text-sm">
                                            {vacationErrors.endDate.message}
                                        </p>
                                    )}
                                </FormField>

                                <FormField>
                                    <Label htmlFor="vacation-reason">Reason (Optional)</Label>
                                    <Textarea
                                        id="vacation-reason"
                                        placeholder="Enter reason for vacation"
                                        {...registerVacation("reason")}
                                    />
                                </FormField>
                            </form>

                            <DialogFooter className="mt-6">
                                <Button variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    form="vacation-form"
                                    disabled={addVacationMutation.isPending}
                                >
                                    {addVacationMutation.isPending ? "Adding..." : "Add Vacation"}
                                </Button>
                            </DialogFooter>
                        </TabsContent>

                        <TabsContent value="sick">
                            <form
                                id="sick-form"
                                onSubmit={handleSubmitSick(onSubmitSick)}
                                className="space-y-4 mt-4"
                            >
                                <FormField>
                                    <Label htmlFor="sick-startDate">
                                        Start Date
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="sick-startDate"
                                        type="date"
                                        {...registerSick("startDate", {
                                            required: "Start date is required",
                                        })}
                                    />
                                    {sickErrors.startDate && (
                                        <p className="text-red-500 text-sm">
                                            {sickErrors.startDate.message}
                                        </p>
                                    )}
                                </FormField>

                                <FormField>
                                    <Label htmlFor="sick-endDate">
                                        End Date
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="sick-endDate"
                                        type="date"
                                        {...registerSick("endDate", {
                                            required: "End date is required",
                                        })}
                                    />
                                    {sickErrors.endDate && (
                                        <p className="text-red-500 text-sm">
                                            {sickErrors.endDate.message}
                                        </p>
                                    )}
                                </FormField>

                                <FormField>
                                    <Label htmlFor="sick-diagnosis">Diagnosis (Optional)</Label>
                                    <Textarea
                                        id="sick-diagnosis"
                                        placeholder="Enter diagnosis"
                                        {...registerSick("diagnosis")}
                                    />
                                </FormField>

                                <FormField>
                                    <Label htmlFor="sick-documentNumber">
                                        Document Number (Optional)
                                    </Label>
                                    <Input
                                        id="sick-documentNumber"
                                        placeholder="Enter document number"
                                        {...registerSick("documentNumber")}
                                    />
                                </FormField>
                            </form>

                            <DialogFooter className="mt-6">
                                <Button variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    form="sick-form"
                                    disabled={addSickLeaveMutation.isPending}
                                >
                                    {addSickLeaveMutation.isPending ? "Adding..." : "Add Sick Leave"}
                                </Button>
                            </DialogFooter>
                        </TabsContent>

                        <TabsContent value="personal">
                            <form
                                id="personal-form"
                                onSubmit={handleSubmitPersonal(onSubmitPersonal)}
                                className="space-y-4 mt-4"
                            >
                                <FormField>
                                    <Label htmlFor="personal-date">
                                        Date
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="personal-date"
                                        type="date"
                                        {...registerPersonal("date", {
                                            required: "Date is required",
                                        })}
                                    />
                                    {personalErrors.date && (
                                        <p className="text-red-500 text-sm">
                                            {personalErrors.date.message}
                                        </p>
                                    )}
                                </FormField>

                                <FormField>
                                    <Label htmlFor="personal-reason">Reason (Optional)</Label>
                                    <Textarea
                                        id="personal-reason"
                                        placeholder="Enter reason for personal day"
                                        {...registerPersonal("reason")}
                                    />
                                </FormField>
                            </form>

                            <DialogFooter className="mt-6">
                                <Button variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    form="personal-form"
                                    disabled={addPersonalDayMutation.isPending}
                                >
                                    {addPersonalDayMutation.isPending ? "Adding..." : "Add Personal Day"}
                                </Button>
                            </DialogFooter>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-6">
                            {/* Vacations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-500" />
                                        Vacations
                                        <Badge variant="secondary">{vacations.length}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {vacationsLoading ? (
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    ) : vacations.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No vacations scheduled</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {vacations.map((vacation) => (
                                                <div
                                                    key={vacation.id}
                                                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="bg-blue-50">
                                                                {formatDate(vacation.startDate)} - {formatDate(vacation.endDate)}
                                                            </Badge>
                                                        </div>
                                                        {vacation.reason && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {vacation.reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(vacation.id!, "vacation")}
                                                        disabled={deleteVacationMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Sick Leaves */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-red-500" />
                                        Sick Leaves
                                        <Badge variant="secondary">{sickLeaves.length}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {sickLeavesLoading ? (
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    ) : sickLeaves.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No sick leaves recorded</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {sickLeaves.map((sick) => (
                                                <div
                                                    key={sick.id}
                                                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="bg-red-50">
                                                                {formatDate(sick.startDate)} - {formatDate(sick.endDate)}
                                                            </Badge>
                                                        </div>
                                                        {sick.diagnosis && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Diagnosis: {sick.diagnosis}
                                                            </p>
                                                        )}
                                                        {sick.documentNumber && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Doc #: {sick.documentNumber}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(sick.id!, "sick")}
                                                        disabled={deleteSickLeaveMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Personal Days */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-amber-500" />
                                        Personal Days
                                        <Badge variant="secondary">{personalDays.length}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {personalDaysLoading ? (
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    ) : personalDays.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No personal days scheduled</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {personalDays.map((day) => (
                                                <div
                                                    key={day.id}
                                                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="bg-amber-50">
                                                                {formatDate(day.date)}
                                                            </Badge>
                                                        </div>
                                                        {day.reason && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {day.reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(day.id!, "personal")}
                                                        disabled={deletePersonalDayMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={handleClose}>
                                Close
                            </Button>
                        </DialogFooter>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}
