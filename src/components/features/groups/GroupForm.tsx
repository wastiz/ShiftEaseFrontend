import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form"
import { Info } from "lucide-react"
import FormField from "@/components/ui/FormField"
import { Label } from "@/components/ui/shadcn/label"
import { Input } from "@/components/ui/shadcn/input"
import { Textarea } from "@/components/ui/shadcn/textarea"
import ColorPicker from "@/components/ui/inputs/ColorPicker"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/shadcn/tooltip"
import { Switch } from "@/components/ui/shadcn/switch"
import { TimePicker } from "@/components/ui/inputs/TimePicker"
import { GroupFormValues } from "@/types"

interface GroupFormProps {
    formId: string
    register: UseFormRegister<GroupFormValues>
    control: Control<GroupFormValues>
    errors: FieldErrors<GroupFormValues>
    hasCustomTime: boolean
    setHasCustomTime: (value: boolean) => void
    onSubmit: (e: React.FormEvent) => void
}

export function GroupForm({
    formId,
    register,
    control,
    errors,
    hasCustomTime,
    setHasCustomTime,
    onSubmit,
}: GroupFormProps) {
    return (
        <form
            id={formId}
            onSubmit={onSubmit}
            className="space-y-4 flex-1 overflow-y-auto"
        >
            {/* Name */}
            <FormField>
                <Label>
                    Group Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                    {...register("name", { required: "Name is required" })}
                    placeholder="Group name"
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </FormField>

            {/* Description */}
            <FormField>
                <Label>Description</Label>
                <Textarea
                    {...register("description")}
                    placeholder="Description (optional)"
                />
            </FormField>

            {/* Color */}
            <FormField>
                <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                        <ColorPicker
                            label="Color"
                            value={field.value || "#3b82f6"}
                            onChange={field.onChange}
                        />
                    )}
                />
            </FormField>

            {/* Custom working time */}
            <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Label>Custom Working Hours</Label>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>
                                        By default, this group uses the organization's working hours.
                                        Enable this to set specific hours for this group.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <Switch
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
                                        value={field.value ?? ""}
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
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </FormField>
                    </div>
                )}
            </div>
        </form>
    )
}
