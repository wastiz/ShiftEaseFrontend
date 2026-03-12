import React, { useState } from "react"
import { useTranslations } from "next-intl"
import { UseFormReturn } from "react-hook-form"
import { Trash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/shadcn/dialog"
import { Button } from "@/components/ui/shadcn/button"
import { Label } from "@/components/ui/shadcn/label"
import { Input } from "@/components/ui/shadcn/input"
import { Checkbox } from "@/components/ui/shadcn/checkbox"
import { TimePicker } from "@/components/ui/inputs/TimePicker"
import ColorPicker from "@/components/ui/inputs/ColorPicker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn/select"
import { DepartmentFormValues, DayOfWeek } from "@/types"
import { useGetShiftTypes, useCreateShiftType, useDeleteShiftType } from "@/hooks/api/employer/shift-types"

const timeToPercent = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return ((h * 60 + (m || 0)) / (24 * 60)) * 100;
};

interface DepartmentConditionsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: UseFormReturn<DepartmentFormValues>
    departmentId?: number
}

const WEEK_DAYS = [
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
    { value: 0, label: "Sun" },
]

export function DepartmentConditionsModal({
    open,
    onOpenChange,
    form,
    departmentId,
}: DepartmentConditionsModalProps) {
    const t = useTranslations('employer.departments')
    const tCommon = useTranslations('common')
    
    // Shift Types API
    const { data: allShiftTypes = [] } = useGetShiftTypes()
    const createShiftTypeMutation = useCreateShiftType()
    const deleteShiftTypeMutation = useDeleteShiftType()

    const departmentShiftTypes = allShiftTypes.filter(st => st.departmentId === departmentId)

    // Form Watches
    const formWorkingDays = form.watch("workingDays")
    const formDefaultPattern = form.watch("defaultSchedulePattern") || "Custom"
    const formStartTime = form.watch("startTime") || "09:00"
    const formEndTime = form.watch("endTime") || "17:00"

    // Default working days to all if empty or undefined
    const initialWorkingDays = formWorkingDays?.length ? formWorkingDays : [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]

    // Local State
    const [workingDays, setWorkingDays] = useState<DayOfWeek[]>(initialWorkingDays)
    const [schedulePattern, setSchedulePattern] = useState<string>(formDefaultPattern)
    const [startTime, setStartTime] = useState<string>(formStartTime)
    const [endTime, setEndTime] = useState<string>(formEndTime)

    // New Shift Type State
    const [newShiftName, setNewShiftName] = useState("")
    const [newShiftStart, setNewShiftStart] = useState("09:00")
    const [newShiftEnd, setNewShiftEnd] = useState("17:00")
    const [newShiftMin, setNewShiftMin] = useState(1)
    const [newShiftMax, setNewShiftMax] = useState(1)
    const [newShiftColor, setNewShiftColor] = useState("#3b82f6")

    React.useEffect(() => {
        if (open) {
            const wd = form.getValues("workingDays")
            setWorkingDays(wd && wd.length > 0 ? wd : [0, 1, 2, 3, 4, 5, 6])
            setSchedulePattern(form.getValues("defaultSchedulePattern") || "Custom")
            setStartTime(form.getValues("startTime") || "09:00")
            setEndTime(form.getValues("endTime") || "17:00")
        }
    }, [open, form])

    const handleSave = () => {
        form.setValue("workingDays", workingDays, { shouldValidate: true, shouldDirty: true })
        form.setValue("defaultSchedulePattern", schedulePattern, { shouldValidate: true, shouldDirty: true })
        form.setValue("startTime", startTime, { shouldValidate: true, shouldDirty: true })
        form.setValue("endTime", endTime, { shouldValidate: true, shouldDirty: true })
        onOpenChange(false)
    }

    const toggleDay = (day: DayOfWeek) => {
        if (workingDays.includes(day)) {
            setWorkingDays(workingDays.filter(d => d !== day))
        } else {
            setWorkingDays([...workingDays, day].sort())
        }
    }

    const handleAddShiftType = () => {
        if (!departmentId || !newShiftName.trim()) return
        createShiftTypeMutation.mutate({
            name: newShiftName,
            startTime: newShiftStart,
            endTime: newShiftEnd,
            minEmployees: newShiftMin,
            maxEmployees: newShiftMax,
            color: newShiftColor,
            departmentId: departmentId,
        }, {
            onSuccess: () => {
                setNewShiftName("")
            }
        })
    }

    const handleDeleteShiftType = (id: number) => {
        deleteShiftTypeMutation.mutate(id)
    }

    // Overlap logic for preview
    const getShiftStyle = (st: any, idx: number, allInDay: any[]) => {
        const top = timeToPercent(st.startTime);
        const bottom = timeToPercent(st.endTime);
        let height = bottom - top;
        if (height < 0) height = (100 - top) + bottom;
        if (height <= 0) height = 5;

        // Simple overlap offset
        const overlaps = allInDay.filter(other => {
            if (other.id === st.id) return false;
            const oTop = timeToPercent(other.startTime);
            const oBottom = timeToPercent(other.endTime);
            let oHeight = oBottom - oTop;
            if (oHeight < 0) oHeight = (100 - oTop) + oBottom;
            
            return (top < oTop + oHeight) && (top + height > oTop);
        });

        const overlapCount = overlaps.length;
        const myIndex = allInDay.indexOf(st) % (overlapCount + 1);
        const width = overlapCount > 0 ? (100 / (overlapCount + 1)) : 100;
        const left = overlapCount > 0 ? (myIndex * width) : 0;

        return {
            top: `${top}%`,
            height: `${height}%`,
            width: `${width}%`,
            left: `${left}%`,
            backgroundColor: `${st.color}40`,
            borderColor: st.color,
            zIndex: 10 + idx
        };
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] h-[95vh] flex flex-col p-6">
                <DialogHeader>
                    <DialogTitle>{t('departmentConditions')}</DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto pr-4 space-y-8">
                    <div className="text-sm text-muted-foreground pb-4 border-b">
                        {t('departmentConditionsTooltip')}
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="space-y-2">
                                <Label>Schedule Pattern</Label>
                                <Select value={schedulePattern} onValueChange={setSchedulePattern}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Pattern" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Custom">Custom</SelectItem>
                                        <SelectItem value="TwoOnTwoOff">2 on / 2 off</SelectItem>
                                        <SelectItem value="FiveOnTwoOff">5 on / 2 off</SelectItem>
                                        <SelectItem value="ThreeOnThreeOff">3 on / 3 off</SelectItem>
                                        <SelectItem value="FourOnFourOff">4 on / 4 off</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <TimePicker value={startTime} onChange={setStartTime} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <TimePicker value={endTime} onChange={setEndTime} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {!departmentId ? (
                            <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded-md border border-amber-200">
                                Please create and save the department first before configuring its specific Shift Types.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Quick Shift Type Form */}
                                <div className="p-4 border rounded-md bg-muted/30 space-y-4">
                                    <Label className="font-semibold pb-2 border-b block">Add Shift Type</Label>
                                    <div className="grid grid-cols-6 gap-4 items-end">
                                        <div className="col-span-2 space-y-2">
                                            <Label className="text-xs">Name</Label>
                                            <Input value={newShiftName} onChange={e => setNewShiftName(e.target.value)} placeholder="e.g. Morning Shift" />
                                        </div>
                                        <div className="col-span-1 space-y-2">
                                            <Label className="text-xs">Start Time</Label>
                                            <TimePicker value={newShiftStart} onChange={setNewShiftStart} />
                                        </div>
                                        <div className="col-span-1 space-y-2">
                                            <Label className="text-xs">End Time</Label>
                                            <TimePicker value={newShiftEnd} onChange={setNewShiftEnd} />
                                        </div>
                                        <div className="col-span-1 space-y-2">
                                            <ColorPicker label="Color" value={newShiftColor} onChange={setNewShiftColor} />
                                        </div>
                                        <div className="col-span-1">
                                            <Button 
                                                className="w-full" 
                                                onClick={handleAddShiftType} 
                                                disabled={!newShiftName || createShiftTypeMutation.isPending}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4 items-center">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Min Employees</Label>
                                            <Input type="number" min={1} value={newShiftMin} onChange={e => setNewShiftMin(parseInt(e.target.value))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Max Employees</Label>
                                            <Input type="number" min={1} value={newShiftMax} onChange={e => setNewShiftMax(parseInt(e.target.value))} />
                                        </div>
                                    </div>
                                </div>

                                {/* Current shift types list */}
                                {departmentShiftTypes.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {departmentShiftTypes.map(st => (
                                            <div key={st.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: st.color, backgroundColor: `${st.color}20`, color: st.color }}>
                                                <span>{st.name} ({st.startTime} - {st.endTime})</span>
                                                <button onClick={() => handleDeleteShiftType(st.id)} className="opacity-70 hover:opacity-100 transition-opacity">
                                                    <Trash className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Weekly Calendar View */}
                                <div className="border rounded-md overflow-hidden bg-background shadow-sm">
                                    <div className="grid grid-cols-7 border-b bg-muted/50">
                                        {WEEK_DAYS.map(day => {
                                            const isSelected = workingDays.includes(day.value as DayOfWeek);
                                            return (
                                                <div key={day.value} className="p-3 text-center text-xs font-semibold border-r last:border-r-0 flex flex-col items-center justify-center gap-2 bg-muted/30">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox 
                                                            id={`day-check-${day.value}`}
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleDay(day.value as DayOfWeek)}
                                                        />
                                                        <Label htmlFor={`day-check-${day.value}`} className={`cursor-pointer ${isSelected ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>
                                                            {day.label}
                                                        </Label>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="grid grid-cols-7 h-[400px]">
                                        {WEEK_DAYS.map(day => {
                                            const isWorkingDay = workingDays.includes(day.value as DayOfWeek)
                                            return (
                                                <div key={day.value} className={`relative border-r last:border-r-0 ${isWorkingDay ? 'bg-background' : 'bg-muted/10 pattern-diagonal-lines'}`}>
                                                    {isWorkingDay && departmentShiftTypes.map((st, idx) => (
                                                        <div 
                                                            key={st.id} 
                                                            className="absolute rounded-sm border shadow-sm p-1 overflow-hidden transition-all hover:z-30 cursor-default group"
                                                            style={getShiftStyle(st, idx, departmentShiftTypes)}
                                                            title={`${st.name} (${st.startTime} - ${st.endTime})`}
                                                        >
                                                            <div className="text-[10px] font-bold leading-tight px-0.5" style={{ color: st.color }}>{st.name}</div>
                                                            <div className="text-[9px] text-muted-foreground font-medium transition-opacity px-0.5">
                                                                <span>{st.minEmployees} - {st.maxEmployees}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {!isWorkingDay && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/30 rotate-[-45deg]">
                                                                No work
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" className="w-32" onClick={() => onOpenChange(false)}>
                        {tCommon('cancel')}
                    </Button>
                    <Button className="w-32" onClick={handleSave}>
                        {tCommon('save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
