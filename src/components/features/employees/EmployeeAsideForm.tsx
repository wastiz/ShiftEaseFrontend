import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { EmployeeForm, EmployeeFormValues } from "./EmployeeForm"
import { Button } from "@/components/ui/shadcn/button"
import { AsideDrawer } from "@/components/ui/AsideDrawer"
import { Employee, Group } from "@/types"

interface EmployeeAsideFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedEmployee: Employee | null
    groups: Group[]
    onCreate: (data: EmployeeFormValues) => void
    onUpdate: (id: number, data: EmployeeFormValues) => void
    onDelete: (id: number) => void
    isCreating?: boolean
    isUpdating?: boolean
    isDeleting?: boolean
}

export function EmployeeAsideForm({
    open,
    onOpenChange,
    selectedEmployee,
    groups,
    onCreate,
    onUpdate,
    onDelete,
    isCreating,
    isUpdating,
    isDeleting,
}: EmployeeAsideFormProps) {
    const t = useTranslations('employer.employees')
    const tCommon = useTranslations('common')
    const formId = "employee-form"

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<EmployeeFormValues>({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            position: "",
            phone: "",
            hourlyRate: undefined,
            priority: undefined,
            groupIds: [],
        },
    })

    const selectedGroupIds = watch("groupIds")

    useEffect(() => {
        if (open) {
            if (selectedEmployee) {
                reset({
                    firstName: selectedEmployee.firstName,
                    lastName: selectedEmployee.lastName,
                    email: selectedEmployee.email,
                    position: selectedEmployee.position,
                    phone: selectedEmployee.phone ?? "",
                    hourlyRate: selectedEmployee.hourlyRate,
                    priority: selectedEmployee.priority as "high" | "medium" | "low" | undefined,
                    groupIds: selectedEmployee.groupIds ?? [],
                })
            } else {
                reset({
                    firstName: "",
                    lastName: "",
                    email: "",
                    position: "",
                    phone: "",
                    hourlyRate: undefined,
                    priority: undefined,
                    groupIds: [],
                })
            }
        }
    }, [open, selectedEmployee, reset])

    const onSubmit = (data: EmployeeFormValues) => {
        if (selectedEmployee) {
            onUpdate(selectedEmployee.id, data)
        } else {
            onCreate(data)
        }
    }

    return (
        <AsideDrawer
            open={open}
            onOpenChange={onOpenChange}
            title={selectedEmployee ? t('editEmployee') : t('addEmployee')}
            description={t('configureDetails')}
            trigger={<Button>+ {t('addEmployee')}</Button>}
            footer={
                <>
                    {selectedEmployee && (
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => onDelete(selectedEmployee.id)}
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
                            : selectedEmployee
                              ? tCommon('update')
                              : tCommon('create')}
                    </Button>
                </>
            }
        >
            <EmployeeForm
                formId={formId}
                register={register}
                control={control}
                errors={errors}
                groups={groups}
                selectedGroupIds={selectedGroupIds}
                onSubmit={handleSubmit(onSubmit)}
            />
        </AsideDrawer>
    )
}
