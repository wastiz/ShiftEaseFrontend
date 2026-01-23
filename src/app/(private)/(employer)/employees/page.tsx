"use client";

import { useState } from "react";
import { Employee } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import Header from "@/modules/common/Header";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/shadcn/drawer";
import { Button } from "@/components/ui/shadcn/button";
import FormField from "@/components/FormField";
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import Loader from "@/components/ui/Loader";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";

import {useCreateEmployee, useDeleteEmployee, useGetEmployees, useGetGroups, useUpdateEmployee} from "@/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/shadcn/select";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/shadcn/tooltip";
import { Info, X, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/shadcn/badge";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import EmployeeCard from "@/components/cards/EmployeeCard";
import TimeOffDialog from "@/components/modals/TimeOffDialog";

type EmployeeFormValues = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    hourlyRate: number;
    priority: string;
    groupIds: number[];
};

export default function Employees() {
    const router = useRouter();
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [timeOffDialogOpen, setTimeOffDialogOpen] = useState(false);
    const [timeOffEmployee, setTimeOffEmployee] = useState<Employee | null>(null);

    const isMobile = useIsMobile();
    const queryClient = useQueryClient();

    const { data: groups = [], isLoading: isGroupLoading } = useGetGroups();
    const { data: employees = [], isLoading: isEmployeeLoading } = useGetEmployees();

    const createMutation = useCreateEmployee();
    const updateMutation = useUpdateEmployee(selectedEmployee?.id ?? 0);
    const deleteMutation = useDeleteEmployee(confirmDeleteId ?? 0);

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        formState: { errors },
    } = useForm<EmployeeFormValues>({
        defaultValues: {
            groupIds: [],
        },
    });

    const selectedGroupIds = watch("groupIds");

    const openDrawer = (employee?: Employee) => {
        setSelectedEmployee(employee ?? null);
        reset({
            firstName: employee?.firstName ?? "",
            lastName: employee?.lastName ?? "",
            email: employee?.email ?? "",
            phone: employee?.phone ?? "",
            position: employee?.position ?? "",
            hourlyRate: employee?.hourlyRate ?? 0,
            priority: employee?.priority ?? "medium",
            groupIds: employee?.groupIds ?? [],
        });
        setDrawerOpen(true);
    };

    const closeForm = () => {
        setSelectedEmployee(null);
        reset();
        setDrawerOpen(false);
    };

    const onSubmit = (payload: EmployeeFormValues) => {
        if (selectedEmployee) {
            updateMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success("Employee updated!");
                    closeForm();
                },
                onError: () => toast.error("Failed to update employee"),
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success("Employee created!");
                    closeForm();
                },
                onError: () => toast.error("Failed to create employee"),
            });
        }
    };

    const handleDelete = () => {
        if (!confirmDeleteId) return;
        deleteMutation.mutate(undefined, {
            onSuccess: () => {
                toast.success("Employee deleted!");
                setConfirmDeleteId(null);
            },
            onError: () => toast.error("Failed to delete employee"),
        });
    };

    const openTimeOffDialog = (employee: Employee) => {
        setTimeOffEmployee(employee);
        setTimeOffDialogOpen(true);
    };

    return (
        <>
            <Header title="Employees">
                <Button onClick={() => router.push("employees/bulk-create")}>+ Add Bulk</Button>
                <Drawer
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    direction={isMobile ? "bottom" : "right"}
                >
                    <DrawerTrigger asChild>
                        <Button onClick={() => openDrawer()}>+ Add Employee</Button>
                    </DrawerTrigger>

                    <DrawerContent
                        className={
                            isMobile
                                ? "inset-x-0"
                                : "fixed inset-y-0 right-0 mt-0 w-96 flex h-full flex-col rounded-l-[10px] border bg-background"
                        }
                    >
                        <DrawerHeader className="gap-1">
                            <DrawerTitle>
                                {selectedEmployee ? "Edit Employee" : "Add Employee"}
                            </DrawerTitle>
                            <DrawerDescription>
                                Configure employee details
                            </DrawerDescription>
                        </DrawerHeader>

                        <form
                            id="employee-form"
                            onSubmit={handleSubmit(onSubmit)}
                            className={`space-y-4 p-4 w-full overflow-y-scroll ${isMobile ? "h-80" : "h-full"}`}
                        >
                            <FormField>
                                <Label htmlFor="firstName">
                                    First Name
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="firstName"
                                    placeholder="Enter first name"
                                    {...register("firstName", { required: "First name is required" })}
                                />
                                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                            </FormField>

                            <FormField>
                                <Label htmlFor="lastName">
                                    Last Name
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="lastName"
                                    placeholder="Enter last name"
                                    {...register("lastName", { required: "Last name is required" })}
                                />
                                {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                            </FormField>

                            <FormField>
                                <Label htmlFor="email">
                                    Email
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter email"
                                    {...register("email", { required: "Email is required" })}
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                            </FormField>

                            <FormField>
                                <Label htmlFor="position">
                                    Position
                                    <span className="text-red-500 ml-1">*</span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-help inline ml-1" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                <p>
                                                    Indicate the position of this employee. For example, senior manager, to see what position he holds.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <Input
                                    id="position"
                                    placeholder="Enter position"
                                    {...register("position", { required: "Position is required" })}
                                />
                                {errors.position && <p className="text-red-500 text-sm">{errors.position.message}</p>}
                            </FormField>

                            <FormField>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="Enter phone"
                                    {...register("phone")}
                                />
                            </FormField>

                            <FormField>
                                <Label htmlFor="hourlyRate">Hourly Rate (€/hour)</Label>
                                <Input
                                    id="hourlyRate"
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter Hourly Rate"
                                    {...register("hourlyRate", {
                                        valueAsNumber: true,
                                    })}
                                />
                            </FormField>

                            <FormField>
                                <Label>Shift Priority</Label>
                                <Controller
                                    name="priority"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>

                            <FormField>
                                <Label>
                                    Groups
                                    <span className="text-muted-foreground text-xs ml-2">(Optional)</span>
                                </Label>

                                {selectedGroupIds && selectedGroupIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {selectedGroupIds.map((gId) => {
                                            const group = groups.find((g) => g.id === gId);
                                            return (
                                                <Badge
                                                    key={gId}
                                                    style={{ backgroundColor: group?.color + "40", borderColor: group?.color }}
                                                    className="border"
                                                >
                                                    {group?.name}
                                                    <Controller
                                                        name="groupIds"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <X
                                                                className="ml-1 h-3 w-3 cursor-pointer"
                                                                onClick={() => {
                                                                    field.onChange(
                                                                        field.value.filter((id) => id !== gId)
                                                                    );
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                )}

                                <Controller
                                    name="groupIds"
                                    control={control}
                                    render={({ field }) => (
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={
                                                        groups.length === 0
                                                            ? "No groups available — employee will be flexible"
                                                            : "Select groups"
                                                    }
                                                />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {groups.length === 0 ? (
                                                    <div className="text-muted-foreground p-2 text-sm">
                                                        No groups created yet. Employee will be flexible.
                                                    </div>
                                                ) : (
                                                    groups.map((g) => (
                                                        <div
                                                            key={g.id}
                                                            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-accent rounded-md"
                                                            onClick={() => {
                                                                const current = new Set(field.value ?? []);
                                                                if (current.has(g.id)) {
                                                                    current.delete(g.id);
                                                                } else {
                                                                    current.add(g.id);
                                                                }
                                                                field.onChange(Array.from(current));
                                                            }}
                                                        >
                                                            <Checkbox
                                                                checked={field.value?.includes(g.id)}
                                                                onCheckedChange={() => {}}
                                                            />
                                                            <span>{g.name}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {selectedGroupIds.length === 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        No groups selected. Employee will be flexible.
                                    </p>
                                )}
                            </FormField>
                        </form>

                        <DrawerFooter className="flex gap-2 justify-end">
                            <Button
                                type="submit"
                                form="employee-form"
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {selectedEmployee ? "Update" : "Create"}
                            </Button>

                            {selectedEmployee && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setConfirmDeleteId(selectedEmployee.id)}
                                    disabled={deleteMutation.isPending}
                                >
                                    Delete
                                </Button>
                            )}

                            <DrawerClose asChild>
                                <Button variant="outline">Close</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </Header>

            <main className="p-4">
                {isEmployeeLoading ? (
                    <Loader />
                ) : employees && employees.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {employees.map((emp) => {
                            const empGroups = groups.filter(g => emp.groupIds?.includes(g.id));
                            return (
                                <EmployeeCard
                                    key={emp.id}
                                    firstName={emp.firstName}
                                    lastName={emp.lastName}
                                    email={emp.email}
                                    position={emp.position}
                                    avatar={"/images/avatar_placeholder.png"}
                                    groups={empGroups}
                                    actions={[
                                        {label: "Edit", onClick: () => openDrawer(emp)},
                                        {
                                            label: "Time Off",
                                            onClick: () => openTimeOffDialog(emp),
                                            variant: "secondary",
                                            icon: <Calendar className="h-4 w-4" />
                                        }
                                    ]}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-40 flex flex-col justify-center items-center space-y-4">
                        <h4>No employees yet</h4>
                        <Button onClick={() => openDrawer()}>Create your first employee</Button>
                    </div>
                )}

                <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Employee</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete this employee?</p>
                        <DialogFooter className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {timeOffEmployee && (
                    <TimeOffDialog
                        open={timeOffDialogOpen}
                        onOpenChange={setTimeOffDialogOpen}
                        employeeId={timeOffEmployee.id}
                        employeeName={`${timeOffEmployee.firstName} ${timeOffEmployee.lastName}`}
                    />
                )}
            </main>
        </>
    );
}
