import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Group, GroupFormValues } from "@/types"
import { AsideDrawer } from "@/components/ui/AsideDrawer"
import { Button } from "@/components/ui/shadcn/button"
import { GroupForm } from "./GroupForm"

interface GroupAsideFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedGroup: Group | null
    onCreate: (data: GroupFormValues) => void
    onUpdate: (id: number, data: GroupFormValues) => void
    onDelete: (id: number) => void
    isCreating?: boolean
    isUpdating?: boolean
    isDeleting?: boolean
}

export function GroupAsideForm({
    open,
    onOpenChange,
    selectedGroup,
    onCreate,
    onUpdate,
    onDelete,
    isCreating,
    isUpdating,
    isDeleting,
}: GroupAsideFormProps) {
    const formId = "group-form"
    const [hasCustomTime, setHasCustomTime] = useState(false)

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<GroupFormValues>({
        defaultValues: {
            name: "",
            description: "",
            color: "#3b82f6",
            startTime: "09:00",
            endTime: "17:00",
        },
    })

    useEffect(() => {
        if (open) {
            if (selectedGroup) {
                reset({
                    name: selectedGroup.name,
                    description: selectedGroup.description ?? "",
                    color: selectedGroup.color,
                    startTime: selectedGroup.startTime ?? "09:00",
                    endTime: selectedGroup.endTime ?? "17:00",
                })
                setHasCustomTime(Boolean(selectedGroup.startTime || selectedGroup.endTime))
            } else {
                reset({
                    name: "",
                    description: "",
                    color: "#3b82f6",
                    startTime: "09:00",
                    endTime: "17:00",
                })
                setHasCustomTime(false)
            }
        }
    }, [open, selectedGroup, reset])

    const onSubmit = (data: GroupFormValues) => {
        const payload = hasCustomTime
            ? data
            : { ...data, startTime: undefined, endTime: undefined }

        if (selectedGroup) {
            onUpdate(selectedGroup.id, payload)
        } else {
            onCreate(payload)
        }
    }

    return (
        <AsideDrawer
            open={open}
            onOpenChange={onOpenChange}
            title={selectedGroup ? "Edit Group" : "Add Group"}
            description="Configure group details"
            trigger={<Button>+ Add Group</Button>}
            footer={
                <>
                    {selectedGroup && (
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => onDelete(selectedGroup.id)}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    )}
                    <Button
                        type="submit"
                        form={formId}
                        disabled={isCreating || isUpdating}
                    >
                        {isCreating || isUpdating
                            ? "Saving..."
                            : selectedGroup
                              ? "Update"
                              : "Create"}
                    </Button>
                </>
            }
        >
            <GroupForm
                formId={formId}
                register={register}
                control={control}
                errors={errors}
                hasCustomTime={hasCustomTime}
                setHasCustomTime={setHasCustomTime}
                onSubmit={handleSubmit(onSubmit)}
            />
        </AsideDrawer>
    )
}
