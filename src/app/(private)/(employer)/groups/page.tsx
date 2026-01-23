"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/shadcn/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/shadcn/dialog";
import { Input } from "@/components/ui/shadcn/input";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Switch } from "@/components/ui/shadcn/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";
import InfoCard from "@/components/cards/InfoCard";
import Header from "@/modules/common/Header";
import { Group, GroupFormValues } from "@/types";
import { useGetGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from "@/api";
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
import FormField from "@/components/FormField";
import { useIsMobile } from "@/hooks/use-mobile";
import { Label } from "@/components/ui/shadcn/label";
import Loader from "@/components/ui/Loader";
import { TimePicker } from "@/components/inputs/TimePicker";
import { Info } from "lucide-react";
import ColorPicker from "@/components/inputs/ColorPicker";

export default function Groups() {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [hasCustomTime, setHasCustomTime] = useState(false);

    const isMobile = useIsMobile();

    const { data: groups, isLoading } = useGetGroups();
    const createMutation = useCreateGroup();
    const updateMutation = useUpdateGroup(selectedGroup?.id ?? 0);
    const deleteMutation = useDeleteGroup();

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<GroupFormValues>();

    const openDrawer = (group?: Group) => {
        setSelectedGroup(group ?? null);

        const hasTime = !!(group?.startTime || group?.endTime);
        setHasCustomTime(hasTime);

        reset({
            name: group?.name ?? "",
            description: group?.description ?? "",
            color: group?.color ?? "#000000",
            startTime: group?.startTime ?? "08:00",
            endTime: group?.endTime ?? "17:00",
        });

        setDrawerOpen(true);
    };

    const closeForm = () => {
        setSelectedGroup(null);
        setHasCustomTime(false);
        reset();
        setDrawerOpen(false);
    };

    const onSubmit = (payload: GroupFormValues) => {
        const data = hasCustomTime ? payload : {
            ...payload,
            startTime: null,
            endTime: null,
        };

        if (selectedGroup) {
            updateMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Group updated!");
                    closeForm();
                },
                onError: () => toast.error("Failed to update group"),
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Group created!");
                    closeForm();
                },
                onError: () => toast.error("Failed to create group"),
            });
        }
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id, {
            onSuccess: () => {
                toast.success("Group deleted!");
                setConfirmDeleteId(null);
            },
            onError: () => toast.error("Failed to delete group"),
        });
    };

    return (
        <>
            <Header title="Groups">
                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction={isMobile ? "bottom" : "right"}>
                    <DrawerTrigger asChild>
                        <Button onClick={() => openDrawer()}>+ Add Group</Button>
                    </DrawerTrigger>

                    <DrawerContent
                        className={
                            isMobile
                                ? "inset-x-0"
                                : "fixed inset-y-0 right-0 mt-0 w-80 flex h-full flex-col rounded-l-[10px] border bg-background"
                        }
                    >
                        <DrawerHeader className="gap-1">
                            <DrawerTitle>{selectedGroup ? "Edit Group" : "Add Group"}</DrawerTitle>
                            <DrawerDescription>Configure your group details</DrawerDescription>
                        </DrawerHeader>

                        <form
                            id="group-form"
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4 p-4 overflow-y-auto"
                        >
                            <FormField>
                                <Label htmlFor="name">
                                    Group Name
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    {...register("name", {required: "Name is required"})}
                                    placeholder="Group name"
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                            </FormField>

                            <FormField>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    {...register("description")}
                                    placeholder="Description (optional)"
                                />
                            </FormField>

                            <FormField>
                                <Controller
                                    name="color"
                                    control={control}
                                    defaultValue="#000000"
                                    render={({ field }) => (
                                        <ColorPicker
                                            label="Color"
                                            value={field.value || "#000000"}
                                            onChange={(color) => field.onChange(color)}
                                        />
                                    )}
                                />
                            </FormField>

                            <div className="border-t pt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="customTime">Custom Working Hours</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>
                                                        By default, this group uses the organization's working hours.
                                                        Enable this to set specific hours for this group (e.g., waiters work
                                                        different hours than kitchen staff).
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Switch
                                        id="customTime"
                                        checked={hasCustomTime}
                                        onCheckedChange={setHasCustomTime}
                                    />
                                </div>

                                {hasCustomTime && (
                                    <div className="space-y-4 pl-4 border-l-2">
                                        <FormField>
                                            <Label>Start Time</Label>
                                            <Controller
                                                name="startTime"
                                                control={control}
                                                render={({ field }) => (
                                                    <TimePicker
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                )}
                                            />
                                        </FormField>

                                        <FormField>
                                            <Label>End Time</Label>
                                            <Controller
                                                name="endTime"
                                                control={control}
                                                render={({ field }) => (
                                                    <TimePicker
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                )}
                                            />
                                        </FormField>
                                    </div>
                                )}
                            </div>
                        </form>

                        <DrawerFooter className="flex gap-2 justify-end">
                            <Button
                                type="submit"
                                form="group-form"
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {createMutation.isPending || updateMutation.isPending
                                    ? "Saving..."
                                    : selectedGroup
                                        ? "Update"
                                        : "Create"}
                            </Button>

                            {selectedGroup && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setConfirmDeleteId(selectedGroup.id)}
                                    disabled={deleteMutation.isPending}
                                >
                                    Delete
                                </Button>
                            )}

                            <DrawerClose asChild>
                                <Button variant="outline" onClick={closeForm}>
                                    Close
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </Header>

            <main className="p-4 overflow-y-scroll">
                {isLoading ? (
                    <Loader />
                ) : groups && groups.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groups.map((group) => (
                            <InfoCard
                                key={group.id}
                                title={group.name}
                                subtitle={
                                    group.description ||
                                    group.name + ". " + (group.startTime && group.endTime
                                        ? `Works from ${group.startTime} till ${group.endTime}`
                                        : "Uses organization hours")
                                }
                                borderColor={group.color}
                                actions={[
                                    { label: "Edit", onClick: () => openDrawer(group) }
                                ]}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mt-60 flex flex-col justify-center items-center space-y-4">
                        <h4>No groups yet</h4>
                        <Button onClick={() => openDrawer()}>Create your first group</Button>
                    </div>
                )}

                <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Group</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete this group?</p>
                        <DialogFooter className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleDelete(confirmDeleteId!)}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </>
    );
}
