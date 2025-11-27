"use client";

import { useState } from "react";
import { Employee } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import Header from "@/modules/Header";
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
import InfoCard from "@/components/cards/InfoCard";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import {
    useCreateEmployee,
    useDeleteEmployee,
    useGetEmployees,
    useUpdateEmployee,
} from "@/api/employees";
import { useGetGroups } from "@/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/shadcn/select";
import {useRouter} from "next/navigation";

type EmployeeFormValues = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    hourlyRate: number;
    priority: string;
    groupId: number;
    groupName?: string | null;
};

export default function Employees() {
    const router = useRouter();
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
        null
    );
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    const isMobile = useIsMobile();
    const queryClient = useQueryClient();

    const { data: groups = [], isLoading: isGroupLoading } = useGetGroups();
    const { data: employees = [], isLoading: isEmployeeLoading } =
        useGetEmployees();

    const createMutation = useCreateEmployee();
    const updateMutation = useUpdateEmployee(selectedEmployee?.id ?? 0);
    const deleteMutation = useDeleteEmployee(confirmDeleteId ?? 0);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<EmployeeFormValues>();

    const openDrawer = (employee?: Employee) => {
        setSelectedEmployee(employee ?? null);
        reset(employee ?? undefined);
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
                            <FormField description={errors.firstName?.message}>
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="Enter first name"
                                    {...register("firstName", { required: "First name is required" })}
                                />
                            </FormField>

                            <FormField description={errors.lastName?.message}>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Enter last name"
                                    {...register("lastName", { required: "Last name is required" })}
                                />
                            </FormField>

                            <FormField description={errors.email?.message}>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter email"
                                    {...register("email", { required: "Email is required" })}
                                />
                            </FormField>

                            <FormField description={errors.phone?.message}>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="Enter phone"
                                    {...register("phone", { required: "Phone is required" })}
                                />
                            </FormField>

                            <FormField description={errors.position?.message}>
                                <Label htmlFor="position">Position</Label>
                                <Input
                                    id="position"
                                    placeholder="Enter position"
                                    {...register("position", { required: "Position is required" })}
                                />
                            </FormField>

                            <FormField description={errors.hourlyRate?.message}>
                                <Label htmlFor="hourlyRate">Hourly Rate</Label>
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

                            <FormField description={errors.priority?.message}>
                                <Label>Shift Priority</Label>
                                <Select
                                    onValueChange={(value) => setValue("priority", value)}
                                    defaultValue={selectedEmployee?.priority}
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
                            </FormField>

                            <FormField description={errors.groupId?.message}>
                                <Label>Group</Label>
                                <Select
                                    onValueChange={(value) => setValue("groupId", Number(value))}
                                    defaultValue={selectedEmployee?.groupId?.toString()}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((g) => (
                                            <SelectItem key={g.id} value={String(g.id)}>
                                                {g.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                        {employees.map((emp) => (
                            <InfoCard
                                key={emp.id}
                                title={`${emp.firstName} ${emp.lastName}`}
                                subtitle={emp.email}
                                actions={[
                                    { label: "Edit", onClick: () => openDrawer(emp) },
                                    { label: "Delete", onClick: () => setConfirmDeleteId(emp.id) },
                                ]}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mt-40 flex flex-col justify-center items-center space-y-4">
                        <h4>No employees yet</h4>
                        <Button onClick={() => openDrawer()}>Create your first employee</Button>
                    </div>
                )}

                {/* Delete Confirmation */}
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
            </main>
        </>
    );
}
