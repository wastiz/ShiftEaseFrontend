import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form"
import { Info, X } from "lucide-react"
import FormField from "@/components/ui/FormField"
import { Label } from "@/components/ui/shadcn/label"
import { Input } from "@/components/ui/shadcn/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/shadcn/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn/select"
import { Badge } from "@/components/ui/shadcn/badge"
import { Checkbox } from "@/components/ui/shadcn/checkbox"
import { Group } from "@/types"

export type EmployeeFormValues = {
    firstName: string
    lastName: string
    email: string
    position: string
    phone?: string
    hourlyRate?: number
    priority?: "high" | "medium" | "low"
    groupIds: number[]
}

interface EmployeeFormProps {
    formId: string
    register: UseFormRegister<EmployeeFormValues>
    control: Control<EmployeeFormValues>
    errors: FieldErrors<EmployeeFormValues>
    groups: Group[]
    selectedGroupIds: number[]
    onSubmit: (e: React.FormEvent) => void
}

export function EmployeeForm({
    formId,
    register,
    control,
    errors,
    groups,
    selectedGroupIds,
    onSubmit,
}: EmployeeFormProps) {
    return (
        <form id={formId} onSubmit={onSubmit} className="space-y-4 w-full">
            {/* First Name */}
            <FormField>
                <Label htmlFor="firstName">
                    First Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                    id="firstName"
                    placeholder="Enter first name"
                    {...register("firstName", {
                        required: "First name is required",
                    })}
                />
                {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
            </FormField>

            {/* Last Name */}
            <FormField>
                <Label htmlFor="lastName">
                    Last Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                    id="lastName"
                    placeholder="Enter last name"
                    {...register("lastName", {
                        required: "Last name is required",
                    })}
                />
                {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
            </FormField>

            {/* Email */}
            <FormField>
                <Label htmlFor="email">
                    Email <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    {...register("email", {
                        required: "Email is required",
                    })}
                />
                {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
            </FormField>

            {/* Position */}
            <FormField>
                <Label htmlFor="position" className="flex items-center gap-1">
                    Position <span className="text-red-500">*</span>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p>
                                    Indicate the position of this employee. For example, senior
                                    manager.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Label>

                <Input
                    id="position"
                    placeholder="Enter position"
                    {...register("position", {
                        required: "Position is required",
                    })}
                />
                {errors.position && (
                    <p className="text-sm text-red-500">{errors.position.message}</p>
                )}
            </FormField>

            {/* Phone */}
            <FormField>
                <Label htmlFor="phone">Phone</Label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone"
                    {...register("phone")}
                />
            </FormField>

            {/* Hourly Rate */}
            <FormField>
                <Label htmlFor="hourlyRate">Hourly Rate ($ / hour)</Label>
                <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    placeholder="Enter hourly rate"
                    {...register("hourlyRate", {
                        valueAsNumber: true,
                    })}
                />
            </FormField>

            {/* Shift Priority */}
            <FormField>
                <Label>Shift Priority</Label>
                <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </FormField>

            {/* Groups */}
            <FormField>
                <Label>
                    Groups
                    <span className="ml-2 text-xs text-muted-foreground">(Optional)</span>
                </Label>

                {/* Selected groups */}
                {selectedGroupIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        <Controller
                            name="groupIds"
                            control={control}
                            render={({ field }) => (
                                <>
                                    {selectedGroupIds.map((groupId) => {
                                        const group = groups.find((g) => g.id === groupId)
                                        if (!group) return null

                                        return (
                                            <Badge
                                                key={group.id}
                                                className="border flex items-center gap-1"
                                                style={{
                                                    backgroundColor: `${group.color}40`,
                                                    borderColor: group.color,
                                                }}
                                            >
                                                {group.name}
                                                <X
                                                    className="h-3 w-3 cursor-pointer"
                                                    onClick={() =>
                                                        field.onChange(
                                                            field.value.filter((id) => id !== group.id)
                                                        )
                                                    }
                                                />
                                            </Badge>
                                        )
                                    })}
                                </>
                            )}
                        />
                    </div>
                )}

                {/* Groups select */}
                <Controller
                    name="groupIds"
                    control={control}
                    render={({ field }) => (
                        <Select>
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        groups.length === 0
                                            ? "No groups available — employee will be flexible"
                                            : "Select groups"
                                    }
                                />
                            </SelectTrigger>

                            <SelectContent>
                                {groups.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground">
                                        No groups created yet. Employee will be flexible.
                                    </div>
                                ) : (
                                    groups.map((group) => {
                                        const selected = field.value?.includes(group.id)

                                        return (
                                            <div
                                                key={group.id}
                                                className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent"
                                                onClick={() => {
                                                    const current = new Set(field.value ?? [])
                                                    selected
                                                        ? current.delete(group.id)
                                                        : current.add(group.id)
                                                    field.onChange(Array.from(current))
                                                }}
                                            >
                                                <Checkbox
                                                    checked={selected}
                                                    onCheckedChange={() => {}}
                                                />
                                                <span>{group.name}</span>
                                            </div>
                                        )
                                    })
                                )}
                            </SelectContent>
                        </Select>
                    )}
                />

                {selectedGroupIds.length === 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        No groups selected. Employee will be flexible.
                    </p>
                )}
            </FormField>
        </form>
    )
}
