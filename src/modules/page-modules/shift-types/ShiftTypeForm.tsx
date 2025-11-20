"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { toast } from "sonner";
import {ShiftType} from "@/types";

type Props = {
    shiftType: ShiftType | null;
    onClose: () => void;
    refetch: () => void;
};

type FormValues = {
    name: string;
    startTime: string;
    endTime: string;
    employeeNeeded: number;
    color: string;
};

export default function ShiftTypeForm({ shiftType, onClose, refetch }: Props) {
    const { register, handleSubmit, reset } = useForm<FormValues>({
        defaultValues: shiftType || {
            name: "",
            startTime: "",
            endTime: "",
            employeeNeeded: 1,
            color: "#000000",
        },
    });

    const createMutation = useMutation({
        mutationFn: (payload: FormValues) => api.post("/ShiftType/organization", payload),
        onSuccess: () => {
            toast.success("Shift type created!");
            refetch();
            onClose();
        },
        onError: () => toast.error("Error creating shift type"),
    });

    const updateMutation = useMutation({
        mutationFn: (payload: FormValues) =>
            api.put(`/ShiftType/${shiftType?.id}`, payload),
        onSuccess: () => {
            toast.success("Shift type updated!");
            refetch();
            onClose();
        },
        onError: () => toast.error("Error updating shift type"),
    });

    const deleteMutation = useMutation({
        mutationFn: () => api.delete(`/ShiftType/${shiftType?.id}`),
        onSuccess: () => {
            toast.success("Shift type deleted!");
            refetch();
            onClose();
        },
        onError: () => toast.error("Error deleting shift type"),
    });

    const onSubmit = (data: FormValues) => {
        if (shiftType) updateMutation.mutate(data);
        else createMutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
                <Label htmlFor="name">Shift Name</Label>
                <Input id="name" {...register("name", { required: true })} />
            </div>

            <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" type="time" {...register("startTime", { required: true })} />
            </div>

            <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" {...register("endTime", { required: true })} />
            </div>

            <div>
                <Label htmlFor="employeeNeeded">Employees Needed</Label>
                <Input
                    id="employeeNeeded"
                    type="number"
                    min={1}
                    {...register("employeeNeeded", { required: true, valueAsNumber: true })}
                />
            </div>

            <div>
                <Label htmlFor="color">Shift Color</Label>
                <Input id="color" type="color" {...register("color")} />
            </div>

            <div className="flex gap-2 justify-end mt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {shiftType ? "Update" : "Create"}
                </Button>

                {shiftType && (
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate()}
                    >
                        Delete
                    </Button>
                )}
            </div>
        </form>
    );
}
