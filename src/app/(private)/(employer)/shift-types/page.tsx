"use client";

import { useState } from "react";
import {Controller, useForm} from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Loader2 } from "lucide-react";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerClose,
    DrawerFooter,
} from "@/components/ui/shadcn/drawer";

import InfoCard from "@/components/cards/InfoCard";
import {ShiftType, ShiftTypeFormValues} from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateShiftType, useDeleteShiftType, useGetShiftTypes, useUpdateShiftType } from "@/api";
import { Label } from "@/components/ui/shadcn/label";
import FormField from "@/components/FormField";
import Header from "@/modules/Header";
import {TimePicker} from "@/components/inputs/TimePicker";

export default function ShiftTypes() {
    const isMobile = useIsMobile();
    const queryClient = useQueryClient();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<ShiftType | null>(null);

    const { data: shifts, isLoading, isError } = useGetShiftTypes();

    const createMutation = useCreateShiftType();
    const updateMutation = useUpdateShiftType(selectedShift?.id ?? 0);
    const deleteMutation = useDeleteShiftType(selectedShift?.id ?? 0);

    const form = useForm<ShiftTypeFormValues>({
        defaultValues: {
            name: "",
            startTime: "00:00",
            endTime: "00:00",
            employeeNeeded: 1,
            color: "#000000",
        },
    });

    const openDrawer = (shift?: ShiftType) => {
        setSelectedShift(shift ?? null);
        form.reset(
            shift ?? {
                name: "",
                startTime: "00:00",
                endTime: "00:00",
                employeeNeeded: 1,
                color: "#000000",
            },
            { keepDirty: false, keepTouched: false }
        );
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setSelectedShift(null);
    };

    const onSubmit = (data: ShiftTypeFormValues) => {
        if (selectedShift) {
            updateMutation.mutate(
                { id: selectedShift.id, ...data },
                { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shift-types"] }); closeDrawer(); } }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["shift-types"] });
                    closeDrawer();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!selectedShift) return;
        deleteMutation.mutate(selectedShift.id, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["shift-types"] });
                closeDrawer();
            },
        });
    };

    return (
        <>
            <Header title={"Shift Types"}>
                <Button onClick={() => openDrawer()}>+ Add Shift</Button>
            </Header>

            <main className={"h-11/12 p-4 overflow-scroll"}>
                {isLoading && (
                    <div className="flex justify-center mt-10">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                )}

                {isError && <p className="text-red-500">Failed to load shift types</p>}

                {!isLoading && shifts && shifts.length === 0 && (
                    <p className="text-muted-foreground">No shifts yet. Create one.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shifts?.map((shift) => (
                        <InfoCard
                            key={shift.id}
                            title={shift.name}
                            subtitle={`Employees: ${shift.employeeNeeded}, ${shift.startTime}-${shift.endTime}`}
                            borderColor={shift.color}
                            actions={[{ label: "Edit", variant: "secondary", onClick: () => openDrawer(shift) }]}
                        />
                    ))}
                </div>
            </main>

            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction={isMobile ? "bottom" : "right"}>
                <DrawerContent
                    className={
                        isMobile
                            ? "inset-x-0"
                            : "fixed inset-y-0 right-0 mt-0 w-80 flex h-full flex-col rounded-l-[10px] border bg-background"
                    }
                >
                    <DrawerHeader className="gap-1">
                        <DrawerTitle>{selectedShift ? "Edit Shift" : "Add Shift"}</DrawerTitle>
                        <DrawerDescription>Configure your shift type details</DrawerDescription>
                    </DrawerHeader>
                    <form id="shift-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto">

                        <FormField>
                            <Label htmlFor="name">Shift Name</Label>
                            <Input id="name" {...form.register("name", { required: true })} />
                        </FormField>

                        <FormField>
                            <Label htmlFor="startTime">Start Time</Label>
                            <Controller
                                name="startTime"
                                control={form.control}
                                rules={{ required: "Start time is required" }}
                                render={({ field }) => (
                                    <TimePicker
                                        value={field.value ?? ""}
                                        onChange={(val) => field.onChange(val || "00:00")}
                                    />
                                )}
                            />
                        </FormField>

                        <FormField>
                            <Label htmlFor="endTime">End Time</Label>
                            <Controller
                                name="endTime"
                                control={form.control}
                                rules={{ required: "End time is required" }}
                                render={({ field }) => (
                                    <TimePicker
                                        value={field.value ?? ""}
                                        onChange={(val) => field.onChange(val || "00:00")}
                                    />
                                )}
                            />

                        </FormField>

                        <FormField>
                            <Label htmlFor="employeeNeeded">Employees Needed</Label>
                            <Input type="number" min={1} id="employeeNeeded" {...form.register("employeeNeeded", { valueAsNumber: true })} />
                        </FormField>

                        <FormField>
                            <Label htmlFor="color">Shift Color</Label>
                            <Input type="color" id="color" {...form.register("color")} />
                        </FormField>
                    </form>

                    <DrawerFooter className="flex gap-2 justify-end">
                        <Button
                            type="submit"
                            form="shift-form"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {selectedShift ? "Update" : "Create"}
                        </Button>

                        {selectedShift && (
                            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                                Delete
                            </Button>
                        )}

                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
