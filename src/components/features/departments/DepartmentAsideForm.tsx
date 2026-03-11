import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { Department, DepartmentFormValues } from "@/types"
import { AsideDrawer } from "@/components/ui/AsideDrawer"
import { Button } from "@/components/ui/shadcn/button"
import { DepartmentForm } from "./DepartmentForm"
import { DepartmentConditionsModal } from "./DepartmentConditionsModal"

interface DepartmentAsideFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedDepartment: Department | null
    onCreate: (data: DepartmentFormValues) => void
    onUpdate: (id: number, data: DepartmentFormValues) => void
    onDelete: (id: number) => void
    isCreating?: boolean
    isUpdating?: boolean
    isDeleting?: boolean
}

export function DepartmentAsideForm({
    open,
    onOpenChange,
    selectedDepartment,
    onCreate,
    onUpdate,
    onDelete,
    isCreating,
    isUpdating,
    isDeleting,
}: DepartmentAsideFormProps) {
    const t = useTranslations('employer.departments')
    const tCommon = useTranslations('common')
    const formId = "department-form"
    const [isConditionsModalOpen, setIsConditionsModalOpen] = useState(false)

    const form = useForm<DepartmentFormValues>({
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
            if (selectedDepartment) {
                form.reset({
                    name: selectedDepartment.name,
                    description: selectedDepartment.description ?? "",
                    color: selectedDepartment.color,
                    startTime: selectedDepartment.startTime ?? "09:00",
                    endTime: selectedDepartment.endTime ?? "17:00",
                    workingDays: selectedDepartment.workingDays ?? [],
                    defaultSchedulePattern: selectedDepartment.defaultSchedulePattern ?? "Custom"
                })
            } else {
                form.reset({
                    name: "",
                    description: "",
                    color: "#3b82f6",
                    startTime: "09:00",
                    endTime: "17:00",
                    workingDays: [],
                    defaultSchedulePattern: "Custom"
                })
            }
        }
    }, [open, selectedDepartment, form])

    const onSubmit = (data: DepartmentFormValues) => {
        const payload = { ...data }

        if (selectedDepartment) {
            onUpdate(selectedDepartment.id, payload)
        } else {
            onCreate(payload)
        }
    }

    return (
        <AsideDrawer
            open={open}
            onOpenChange={onOpenChange}
            title={selectedDepartment ? t('editDepartment') : t('addDepartment')}
            description={t('configureDetails')}
            trigger={<Button>+ {t('addDepartment')}</Button>}
            footer={
                <>
                    {selectedDepartment && (
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => onDelete(selectedDepartment.id)}
                        >
                            {isDeleting ? tCommon('deleting') : tCommon('delete')}
                        </Button>
                    )}
                    <Button
                        type="submit"
                        form={formId}
                        disabled={isCreating || isUpdating}
                    >
                        {isCreating || isUpdating
                            ? tCommon('saving')
                            : selectedDepartment
                              ? tCommon('update')
                              : tCommon('create')}
                    </Button>
                </>
            }
        >
            <DepartmentForm
                formId={formId}
                register={form.register}
                control={form.control}
                errors={form.formState.errors}
                onOpenConditionsModal={() => setIsConditionsModalOpen(true)}
                onSubmit={form.handleSubmit(onSubmit)}
            />

            <DepartmentConditionsModal
                open={isConditionsModalOpen}
                onOpenChange={setIsConditionsModalOpen}
                form={form}
                departmentId={selectedDepartment?.id}
            />
        </AsideDrawer>
    )
}
