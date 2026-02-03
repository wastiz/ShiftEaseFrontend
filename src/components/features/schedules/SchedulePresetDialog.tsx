'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog'
import { Button } from '@/components/ui/shadcn/button'
import { Input } from '@/components/ui/shadcn/input'
import { Label } from '@/components/ui/shadcn/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select'
import { SchedulePattern } from '@/types/schedule'
import { ShiftType } from '@/types/shiftType'
import { Checkbox } from '@/components/ui/shadcn/checkbox'
import { useTranslations } from 'next-intl'

export type SchedulePreset = {
    AllowedShiftTypeIds: number[]
    MaxConsecutiveShifts: number
    SchedulePattern: SchedulePattern
    MinDaysOffPerWeek: number
}

type SchedulePresetDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    shiftTypes: ShiftType[]
    groupId: number
    onSave: (preset: SchedulePreset) => void
}

const STORAGE_KEY_PREFIX = 'schedule_preset_'

const getStorageKey = (groupId: number) => `${STORAGE_KEY_PREFIX}${groupId}`

const defaultPreset: SchedulePreset = {
    AllowedShiftTypeIds: [],
    MaxConsecutiveShifts: 5,
    SchedulePattern: SchedulePattern.Custom,
    MinDaysOffPerWeek: 2
}

export default function SchedulePresetDialog({
    open,
    onOpenChange,
    shiftTypes,
    groupId,
    onSave
}: SchedulePresetDialogProps) {
    const t = useTranslations('schedule')
    const [preset, setPreset] = useState<SchedulePreset>(defaultPreset)

    // Load preset from localStorage when dialog opens
    useEffect(() => {
        if (open) {
            const stored = localStorage.getItem(getStorageKey(groupId))
            if (stored) {
                try {
                    const parsedPreset = JSON.parse(stored)
                    setPreset(parsedPreset)
                } catch (e) {
                    console.error('Failed to parse stored preset', e)
                    setPreset(defaultPreset)
                }
            } else {
                // Initialize with all shift types selected by default
                setPreset({
                    ...defaultPreset,
                    AllowedShiftTypeIds: shiftTypes.map(st => st.id)
                })
            }
        }
    }, [open, groupId, shiftTypes])

    const handleSave = () => {
        // Save to localStorage
        localStorage.setItem(getStorageKey(groupId), JSON.stringify(preset))
        onSave(preset)
        onOpenChange(false)
    }

    const toggleShiftType = (shiftTypeId: number) => {
        setPreset(prev => {
            const isSelected = prev.AllowedShiftTypeIds.includes(shiftTypeId)
            return {
                ...prev,
                AllowedShiftTypeIds: isSelected
                    ? prev.AllowedShiftTypeIds.filter(id => id !== shiftTypeId)
                    : [...prev.AllowedShiftTypeIds, shiftTypeId]
            }
        })
    }

    const getSchedulePatternLabel = (pattern: SchedulePattern): string => {
        switch (pattern) {
            case SchedulePattern.Custom:
                return t('patternCustom')
            case SchedulePattern.TwoOnTwoOff:
                return t('patternTwoOnTwoOff')
            case SchedulePattern.FiveOnTwoOff:
                return t('patternFiveOnTwoOff')
            case SchedulePattern.ThreeOnThreeOff:
                return t('patternThreeOnThreeOff')
            case SchedulePattern.FourOnFourOff:
                return t('patternFourOnFourOff')
            default:
                return 'Custom'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('schedulePresetTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('schedulePresetDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Schedule Pattern */}
                    <div className="space-y-2">
                        <Label htmlFor="pattern">{t('schedulePattern')}</Label>
                        <Select
                            value={preset.SchedulePattern.toString()}
                            onValueChange={(value) => setPreset(prev => ({
                                ...prev,
                                SchedulePattern: parseInt(value) as SchedulePattern
                            }))}
                        >
                            <SelectTrigger id="pattern">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={SchedulePattern.Custom.toString()}>
                                    {getSchedulePatternLabel(SchedulePattern.Custom)}
                                </SelectItem>
                                <SelectItem value={SchedulePattern.TwoOnTwoOff.toString()}>
                                    {getSchedulePatternLabel(SchedulePattern.TwoOnTwoOff)}
                                </SelectItem>
                                <SelectItem value={SchedulePattern.FiveOnTwoOff.toString()}>
                                    {getSchedulePatternLabel(SchedulePattern.FiveOnTwoOff)}
                                </SelectItem>
                                <SelectItem value={SchedulePattern.ThreeOnThreeOff.toString()}>
                                    {getSchedulePatternLabel(SchedulePattern.ThreeOnThreeOff)}
                                </SelectItem>
                                <SelectItem value={SchedulePattern.FourOnFourOff.toString()}>
                                    {getSchedulePatternLabel(SchedulePattern.FourOnFourOff)}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Max Consecutive Shifts */}
                    <div className="space-y-2">
                        <Label htmlFor="maxConsecutive">{t('maxConsecutiveShifts')}</Label>
                        <Input
                            id="maxConsecutive"
                            type="number"
                            min="1"
                            max="31"
                            value={preset.MaxConsecutiveShifts}
                            onChange={(e) => setPreset(prev => ({
                                ...prev,
                                MaxConsecutiveShifts: parseInt(e.target.value) || 1
                            }))}
                        />
                    </div>

                    {/* Min Days Off Per Week */}
                    <div className="space-y-2">
                        <Label htmlFor="minDaysOff">{t('minDaysOffPerWeek')}</Label>
                        <Input
                            id="minDaysOff"
                            type="number"
                            min="0"
                            max="7"
                            value={preset.MinDaysOffPerWeek}
                            onChange={(e) => setPreset(prev => ({
                                ...prev,
                                MinDaysOffPerWeek: parseInt(e.target.value) || 0
                            }))}
                        />
                    </div>

                    {/* Allowed Shift Types */}
                    <div className="space-y-2">
                        <Label>{t('allowedShiftTypes')}</Label>
                        <div className="space-y-2 border rounded-md p-4 max-h-60 overflow-y-auto">
                            {shiftTypes.map((shiftType) => (
                                <div key={shiftType.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`shift-${shiftType.id}`}
                                        checked={preset.AllowedShiftTypeIds.includes(shiftType.id)}
                                        onCheckedChange={() => toggleShiftType(shiftType.id)}
                                    />
                                    <label
                                        htmlFor={`shift-${shiftType.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        <span
                                            className="inline-block w-4 h-4 rounded mr-2"
                                            style={{ backgroundColor: shiftType.color }}
                                        />
                                        {shiftType.name} ({shiftType.startTime} - {shiftType.endTime})
                                    </label>
                                </div>
                            ))}
                        </div>
                        {preset.AllowedShiftTypeIds.length === 0 && (
                            <p className="text-sm text-red-500">{t('selectAtLeastOneShiftType')}</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={preset.AllowedShiftTypeIds.length === 0}
                    >
                        {t('savePreset')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}