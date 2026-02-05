import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form"
import { useTranslations } from "next-intl"
import FormField from "@/components/ui/FormField"
import { Label } from "@/components/ui/shadcn/label"
import { Input } from "@/components/ui/shadcn/input"
import { TimePicker } from "@/components/ui/inputs/TimePicker"
import ColorPicker from "@/components/ui/inputs/ColorPicker"
import { ShiftTypeFormValues } from "@/types"

interface ShiftTypeFormProps {
    formId: string
    register: UseFormRegister<ShiftTypeFormValues>
    control: Control<ShiftTypeFormValues>
    errors: FieldErrors<ShiftTypeFormValues>
    minEmployees?: number
    onSubmit: (e: React.FormEvent) => void
}

export function ShiftTypeForm({
    formId,
    register,
    control,
    errors,
    minEmployees,
    onSubmit,
}: ShiftTypeFormProps) {
    const t = useTranslations('employer.shiftTypes');

    return (
        <form
            id={formId}
            onSubmit={onSubmit}
            className="flex flex-col gap-4 flex-1 overflow-y-auto"
        >
            {/* Shift name */}
            <FormField>
                <Label>
                    {t('shiftName')} <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                    {...register("name", {
                        required: t('shiftNameRequired'),
                    })}
                    placeholder={t('enterShiftName')}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </FormField>

            {/* Start time */}
            <FormField>
                <Label>
                    {t('startTime')} <span className="text-red-500 ml-1">*</span>
                </Label>
                <Controller
                    name="startTime"
                    control={control}
                    rules={{ required: t('startTimeRequired') }}
                    render={({ field }) => (
                        <TimePicker
                            value={field.value ?? ""}
                            onChange={(val) => field.onChange(val || "00:00")}
                        />
                    )}
                />
                {errors.startTime && (
                    <p className="text-sm text-red-500">{errors.startTime.message}</p>
                )}
            </FormField>

            {/* End time */}
            <FormField>
                <Label>
                    {t('endTime')} <span className="text-red-500 ml-1">*</span>
                </Label>
                <Controller
                    name="endTime"
                    control={control}
                    rules={{ required: t('endTimeRequired') }}
                    render={({ field }) => (
                        <TimePicker
                            value={field.value ?? ""}
                            onChange={(val) => field.onChange(val || "00:00")}
                        />
                    )}
                />
                {errors.endTime && (
                    <p className="text-sm text-red-500">{errors.endTime.message}</p>
                )}
            </FormField>

            {/* Min / Max employees */}
            <div className="grid grid-cols-2 gap-4">
                <FormField>
                    <Label>
                        {t('minEmployees')} <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                        type="number"
                        min={1}
                        {...register("minEmployees", {
                            valueAsNumber: true,
                            required: t('minEmployeesRequired'),
                            min: { value: 1, message: t('atLeast1Employee') },
                        })}
                    />
                    {errors.minEmployees && (
                        <p className="text-sm text-red-500">
                            {errors.minEmployees.message}
                        </p>
                    )}
                </FormField>

                <FormField>
                    <Label>
                        {t('maxEmployees')} <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                        type="number"
                        min={minEmployees || 1}
                        {...register("maxEmployees", {
                            valueAsNumber: true,
                            required: t('maxEmployeesRequired'),
                            min: {
                                value: minEmployees || 1,
                                message: t('mustBeAtLeast', { count: minEmployees || 1 }),
                            },
                            validate: (value) =>
                                value >= (minEmployees || 1) ||
                                t('maxMustBeGreaterThanMin'),
                        })}
                    />
                    {errors.maxEmployees && (
                        <p className="text-sm text-red-500">
                            {errors.maxEmployees.message}
                        </p>
                    )}
                </FormField>
            </div>

            {/* Color */}
            <FormField>
                <Controller
                    name="color"
                    control={control}
                    rules={{ required: t('colorRequired') }}
                    render={({ field }) => (
                        <ColorPicker
                            label={t('shiftColor')}
                            value={field.value || "#000000"}
                            onChange={field.onChange}
                        />
                    )}
                />
                {errors.color && (
                    <p className="text-sm text-red-500">{errors.color.message}</p>
                )}
            </FormField>
        </form>
    )
}
