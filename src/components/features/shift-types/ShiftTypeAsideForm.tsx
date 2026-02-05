import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { ShiftType, ShiftTypeFormValues } from "@/types"
import { AsideDrawer } from "@/components/ui/AsideDrawer"
import { Button } from "@/components/ui/shadcn/button"
import { ShiftTypeForm } from "./ShiftTypeForm"

interface ShiftTypeAsideFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedShift: ShiftType | null
    onCreate: (data: ShiftTypeFormValues) => void
    onUpdate: (id: number, data: ShiftTypeFormValues) => void
    onDelete: (id: number) => void
    isCreating?: boolean
    isUpdating?: boolean
    isDeleting?: boolean
}

export function ShiftTypeAsideForm({
    open,
    onOpenChange,
    selectedShift,
    onCreate,
    onUpdate,
    onDelete,
    isCreating,
    isUpdating,
    isDeleting,
}: ShiftTypeAsideFormProps) {
    const t = useTranslations('employer.shiftTypes')
    const tCommon = useTranslations('common')
    const formId = "shift-type-form"

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<ShiftTypeFormValues>({
        defaultValues: {
            name: "",
            startTime: "09:00",
            endTime: "17:00",
            minEmployees: 1,
            maxEmployees: 1,
            color: "#3b82f6",
        },
    })

    const minEmployees = watch("minEmployees")

    useEffect(() => {
        if (open) {
            if (selectedShift) {
                reset({
                    name: selectedShift.name,
                    startTime: selectedShift.startTime,
                    endTime: selectedShift.endTime,
                    minEmployees: selectedShift.minEmployees,
                    maxEmployees: selectedShift.maxEmployees,
                    color: selectedShift.color,
                })
            } else {
                reset({
                    name: "",
                    startTime: "09:00",
                    endTime: "17:00",
                    minEmployees: 1,
                    maxEmployees: 1,
                    color: "#3b82f6",
                })
            }
        }
    }, [open, selectedShift, reset])

    const onSubmit = (data: ShiftTypeFormValues) => {
        if (selectedShift) {
            onUpdate(selectedShift.id, data)
        } else {
            onCreate(data)
        }
    }

    return (
        <AsideDrawer
            open={open}
            onOpenChange={onOpenChange}
            title={selectedShift ? t('editShiftType') : t('addShiftType')}
            description={t('configureShiftTypeDetails')}
            trigger={<Button>+ {t('addShiftType')}</Button>}
            footer={
                <>
                    {selectedShift && (
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => onDelete(selectedShift.id)}
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
                            : selectedShift
                              ? tCommon('update')
                              : tCommon('create')}
                    </Button>
                </>
            }
        >
            <ShiftTypeForm
                formId={formId}
                register={register}
                control={control}
                errors={errors}
                minEmployees={minEmployees}
                onSubmit={handleSubmit(onSubmit)}
            />
        </AsideDrawer>
    )
}
