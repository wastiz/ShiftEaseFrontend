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
import Header from "@/modules/common/Header";
import {TimePicker} from "@/components/inputs/TimePicker";
import ColorPicker from "@/components/inputs/ColorPicker";

export default function ShiftTypes() {
    const isMobile = useIsMobile();
    const queryClient = useQueryClient();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<ShiftType | null>(null);

    const { data: shifts, isLoading, isError } = useGetShiftTypes();

    const createMutation = useCreateShiftType();
    const updateMutation = useUpdateShiftType(selectedShift?.id ?? 0);
    const deleteMutation = useDeleteShiftType();

    const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<ShiftTypeFormValues>({
        defaultValues: {
            name: "",
            startTime: "00:00",
            endTime: "00:00",
            minEmployees: 1,
            maxEmployees: 1,
            color: "#000000",
        },
    });

    const minEmployees = watch("minEmployees");

    const openDrawer = (shift?: ShiftType) => {
        setSelectedShift(shift ?? null);
        reset(
            shift ?? {
                name: "",
                startTime: "00:00",
                endTime: "00:00",
                minEmployees: 1,
                maxEmployees: 1,
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
                            subtitle={`Employees: ${shift.minEmployees}-${shift.maxEmployees}, ${shift.startTime}-${shift.endTime}`}
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
                    <form id="shift-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto">

                        <FormField>
                            <Label htmlFor="name">
                                Shift Name
                                <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="name"
                                {...register("name", { required: "Shift name is required" })}
                                placeholder="Enter shift name"
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </FormField>

                        <FormField>
                            <Label htmlFor="startTime">
                                Start Time
                                <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Controller
                                name="startTime"
                                control={control}
                                rules={{ required: "Start time is required" }}
                                render={({ field }) => (
                                    <TimePicker
                                        value={field.value ?? ""}
                                        onChange={(val) => field.onChange(val || "00:00")}
                                    />
                                )}
                            />
                            {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
                        </FormField>

                        <FormField>
                            <Label htmlFor="endTime">
                                End Time
                                <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Controller
                                name="endTime"
                                control={control}
                                rules={{ required: "End time is required" }}
                                render={({ field }) => (
                                    <TimePicker
                                        value={field.value ?? ""}
                                        onChange={(val) => field.onChange(val || "00:00")}
                                    />
                                )}
                            />
                            {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
                        </FormField>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField>
                                <Label htmlFor="minEmployees">
                                    Min Employees
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    id="minEmployees"
                                    {...register("minEmployees", {
                                        valueAsNumber: true,
                                        required: "Min employees is required",
                                        min: { value: 1, message: "At least 1 employee is required" }
                                    })}
                                />
                                {errors.minEmployees && <p className="text-red-500 text-sm">{errors.minEmployees.message}</p>}
                            </FormField>

                            <FormField>
                                <Label htmlFor="maxEmployees">
                                    Max Employees
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    min={minEmployees || 1}
                                    id="maxEmployees"
                                    {...register("maxEmployees", {
                                        valueAsNumber: true,
                                        required: "Max employees is required",
                                        min: { value: minEmployees || 1, message: `Must be at least ${minEmployees || 1}` },
                                        validate: (value) => value >= minEmployees || "Max must be >= Min"
                                    })}
                                />
                                {errors.maxEmployees && <p className="text-red-500 text-sm">{errors.maxEmployees.message}</p>}
                            </FormField>
                        </div>

                        <FormField>
                            <Controller
                                name="color"
                                control={control}
                                defaultValue="#000000"
                                rules={{ required: "Color is required" }}
                                render={({ field }) => (
                                    <ColorPicker
                                        label="Shift Color"
                                        value={field.value || "#000000"}
                                        onChange={(color) => field.onChange(color)}
                                    />
                                )}
                            />
                            {errors.color && <p className="text-red-500 text-sm">{errors.color.message}</p>}
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
