import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form"
import { Info } from "lucide-react"
import { useTranslations } from "next-intl"
import FormField from "@/components/ui/FormField"
import { Label } from "@/components/ui/shadcn/label"
import { Input } from "@/components/ui/shadcn/input"
import { Textarea } from "@/components/ui/shadcn/textarea"
import ColorPicker from "@/components/ui/inputs/ColorPicker"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/shadcn/tooltip"
import { Switch } from "@/components/ui/shadcn/switch"
import { TimePicker } from "@/components/ui/inputs/TimePicker"
import { DepartmentFormValues } from "@/types"

interface DepartmentFormProps {
    formId: string
    register: UseFormRegister<DepartmentFormValues>
    control: Control<DepartmentFormValues>
    errors: FieldErrors<DepartmentFormValues>
    onOpenConditionsModal: () => void
    onSubmit: (e: React.FormEvent) => void
}

export function DepartmentForm({
    formId,
    register,
    control,
    errors,
    onOpenConditionsModal,
    onSubmit,
}: DepartmentFormProps) {
    const t = useTranslations('employer.departments');
    const tCommon = useTranslations('common');

    return (
        <form
            id={formId}
            onSubmit={onSubmit}
            className="space-y-4 flex-1 overflow-y-auto"
        >
            {/* Name */}
            <FormField>
                <Label>
                    {t('departmentName')} <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                    {...register("name", { required: t('nameRequired') })}
                    placeholder={t('enterDepartmentName')}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </FormField>

            {/* Description */}
            <FormField>
                <Label>{tCommon('description')}</Label>
                <Textarea
                    {...register("description")}
                    placeholder={t('descriptionOptional')}
                />
            </FormField>

            {/* Color */}
            <FormField>
                <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                        <ColorPicker
                            label={t('color')}
                            value={field.value || "#3b82f6"}
                            onChange={field.onChange}
                        />
                    )}
                />
            </FormField>

            {/* Department Conditions Button */}
            <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Label>{t('departmentConditions')}</Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>
                                        {t('departmentConditionsTooltip')}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onOpenConditionsModal}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors text-sm font-medium"
                >
                    {t('configureConditions')}
                </button>
            </div>
        </form>
    )
}
