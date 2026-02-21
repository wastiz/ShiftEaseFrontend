"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Group, GroupFormValues } from "@/types";
import Header from "@/components/ui/Header";
import Loader from "@/components/ui/Loader";
import GroupCard from "@/components/ui/cards/GroupCard";
import { GroupAsideForm } from "@/components/features/groups";
import { Button } from "@/components/ui/shadcn/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/shadcn/dialog";
import {
    useGetGroups,
    useCreateGroup,
    useUpdateGroup,
    useDeleteGroup,
} from "@/hooks/api";
import {useTranslations} from "next-intl";

export default function Groups() {
    const t = useTranslations("employer.groups");
    const tCommon = useTranslations("common")
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    const { data: groups = [], isLoading } = useGetGroups();

    const createMutation = useCreateGroup();
    const updateMutation = useUpdateGroup(selectedGroup?.id ?? 0);
    const deleteMutation = useDeleteGroup();

    const openDrawer = (group?: Group) => {
        setSelectedGroup(group ?? null);
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setSelectedGroup(null);
        setDrawerOpen(false);
    };

    const handleCreate = (data: GroupFormValues) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                toast.success("Group created!");
                closeDrawer();
            },
            onError: () => toast.error("Failed to create group"),
        });
    };

    const handleUpdate = (_id: number, data: GroupFormValues) => {
        updateMutation.mutate(data, {
            onSuccess: () => {
                toast.success("Group updated!");
                closeDrawer();
            },
            onError: () => toast.error("Failed to update group"),
        });
    };

    const handleDeleteClick = (id: number) => {
        setConfirmDeleteId(id);
    };

    const handleDeleteConfirm = () => {
        if (!confirmDeleteId) return;
        deleteMutation.mutate(confirmDeleteId, {
            onSuccess: () => {
                toast.success("Group deleted!");
                setConfirmDeleteId(null);
                closeDrawer();
            },
            onError: () => toast.error("Failed to delete group"),
        });
    };

    const getWorkingHours = (group: Group) => {
        if (group.startTime && group.endTime) {
            return `${group.startTime} - ${group.endTime}`;
        }
        return t("usesOrganizationHours");
    };

    return (
        <>
            <Header title={t("title")}>
                <GroupAsideForm
                    open={drawerOpen}
                    onOpenChange={(open) => {
                        if (!open) closeDrawer();
                        else setDrawerOpen(true);
                    }}
                    selectedGroup={selectedGroup}
                    onCreate={handleCreate}
                    onUpdate={handleUpdate}
                    onDelete={handleDeleteClick}
                    isCreating={createMutation.isPending}
                    isUpdating={updateMutation.isPending}
                    isDeleting={deleteMutation.isPending}
                />
            </Header>

            <main className="p-4">
                {isLoading ? (
                    <Loader />
                ) : groups.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groups.map((group) => (
                            <GroupCard
                                key={group.id}
                                name={group.name}
                                description={group.description}
                                color={group.color}
                                workingHours={getWorkingHours(group)}
                                actions={[
                                    {
                                        label: tCommon("edit"),
                                        onClick: () => openDrawer(group),
                                    },
                                ]}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mt-40 flex flex-col justify-center items-center space-y-4">
                        <h4>No groups yet</h4>
                        <Button onClick={() => openDrawer()}>
                            Create your first group
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
                            <DialogTitle>Delete Group</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete this group?</p>
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
            </main>
        </>
    );
}
