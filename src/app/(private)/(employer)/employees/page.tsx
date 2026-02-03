"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

import { Employee } from "@/types";
import Header from "@/components/ui/Header";
import { Button } from "@/components/ui/shadcn/button";
import Loader from "@/components/ui/Loader";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import EmployeeCard from "@/components/ui/cards/EmployeeCard";
import {
    TimeOffDialog,
    EmployeeAsideForm,
    EmployeeFormValues,
    EmployeeFilters,
    useEmployeeFilters,
} from "@/components/features/employees";
import {
    useCreateEmployee,
    useDeleteEmployee,
    useGetEmployees,
    useGetGroups,
    useUpdateEmployee,
} from "@/hooks/api";

export default function Employees() {
    const router = useRouter();

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [timeOffDialogOpen, setTimeOffDialogOpen] = useState(false);
    const [timeOffEmployee, setTimeOffEmployee] = useState<Employee | null>(null);

    const { data: groups = [] } = useGetGroups();
    const { data: employees = [], isLoading: isEmployeeLoading } = useGetEmployees();

    const {
        filters,
        setFilters,
        filteredEmployees,
        totalCount,
        filteredCount,
    } = useEmployeeFilters(employees);

    const createMutation = useCreateEmployee();
    const updateMutation = useUpdateEmployee(selectedEmployee?.id ?? 0);
    const deleteMutation = useDeleteEmployee(confirmDeleteId ?? 0);

    const openDrawer = (employee?: Employee) => {
        setSelectedEmployee(employee ?? null);
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setSelectedEmployee(null);
        setDrawerOpen(false);
    };

    const handleCreate = (data: EmployeeFormValues) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                toast.success("Employee created!");
                closeDrawer();
            },
            onError: () => toast.error("Failed to create employee"),
        });
    };

    const handleUpdate = (_id: number, data: EmployeeFormValues) => {
        updateMutation.mutate(data, {
            onSuccess: () => {
                toast.success("Employee updated!");
                closeDrawer();
            },
            onError: () => toast.error("Failed to update employee"),
        });
    };

    const handleDeleteClick = (id: number) => {
        setConfirmDeleteId(id);
    };

    const handleDeleteConfirm = () => {
        if (!confirmDeleteId) return;
        deleteMutation.mutate(undefined, {
            onSuccess: () => {
                toast.success("Employee deleted!");
                setConfirmDeleteId(null);
                closeDrawer();
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
                <Button variant="outline" onClick={() => router.push("employees/bulk-create")}>
                    + Add Bulk
                </Button>
                <EmployeeAsideForm
                    open={drawerOpen}
                    onOpenChange={(open) => {
                        if (!open) closeDrawer();
                        else setDrawerOpen(true);
                    }}
                    selectedEmployee={selectedEmployee}
                    groups={groups}
                    onCreate={handleCreate}
                    onUpdate={handleUpdate}
                    onDelete={handleDeleteClick}
                    isCreating={createMutation.isPending}
                    isUpdating={updateMutation.isPending}
                    isDeleting={deleteMutation.isPending}
                />
            </Header>

            <main className="p-4 space-y-4">
                {isEmployeeLoading ? (
                    <Loader />
                ) : employees && employees.length > 0 ? (
                    <>
                        <EmployeeFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            groups={groups}
                            totalCount={totalCount}
                            filteredCount={filteredCount}
                        />

                        {filteredEmployees.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredEmployees.map((emp) => {
                                    const empGroups = groups.filter((g) =>
                                        emp.groupIds?.includes(g.id)
                                    );
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
                                                { label: "Edit", onClick: () => openDrawer(emp) },
                                                {
                                                    label: "Time Off",
                                                    onClick: () => openTimeOffDialog(emp),
                                                    variant: "secondary",
                                                    icon: <Calendar className="h-4 w-4" />,
                                                },
                                            ]}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-20 flex flex-col justify-center items-center space-y-2">
                                <p className="text-muted-foreground">No employees match your filters</p>
                                <Button variant="ghost" onClick={() => setFilters({ search: "", groupIds: [] })}>
                                    Clear filters
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="mt-40 flex flex-col justify-center items-center space-y-4">
                        <h4>No employees yet</h4>
                        <Button onClick={() => openDrawer()}>
                            Create your first employee
                        </Button>
                    </div>
                )}

                {/* Delete confirmation dialog */}
                <Dialog
                    open={!!confirmDeleteId}
                    onOpenChange={() => setConfirmDeleteId(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Employee</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete this employee?</p>
                        <DialogFooter className="flex justify-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Time off dialog */}
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
