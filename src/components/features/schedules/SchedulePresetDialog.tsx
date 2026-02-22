'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog'
import { Button } from '@/components/ui/shadcn/button'
import { Input } from '@/components/ui/shadcn/input'
import { Label } from '@/components/ui/shadcn/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs'
import { SchedulePattern } from '@/types/schedule'
import { ShiftType } from '@/types/shiftType'
import { Checkbox } from '@/components/ui/shadcn/checkbox'
import { useTranslations } from 'next-intl'

export type StandardPreset = {
    mode: 'standard'
    AllowedShiftTypeIds: number[]
    MaxConsecutiveShifts: number
    SchedulePattern: SchedulePattern
    MinDaysOffPerWeek: number
}

export type RetailPreset = {
    mode: 'retail'
    totalHours: number
    maxConsecutiveShifts: number
    minDaysOffPerWeek: number
}

export type SchedulePreset = StandardPreset | RetailPreset

type SchedulePresetDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    shiftTypes: ShiftType[]
    onSave: (preset: SchedulePreset) => void
}

const STORAGE_KEY_STANDARD = 'schedule_preset_standard'
const STORAGE_KEY_RETAIL = 'schedule_preset_retail'

const defaultStandardPreset: Omit<StandardPreset, 'mode'> = {
    AllowedShiftTypeIds: [],
    MaxConsecutiveShifts: 5,
    SchedulePattern: SchedulePattern.Custom,
    MinDaysOffPerWeek: 2,
}

const defaultRetailPreset: Omit<RetailPreset, 'mode'> = {
    totalHours: 160,
    maxConsecutiveShifts: 5,
    minDaysOffPerWeek: 2,
}

export default function SchedulePresetDialog({
    open,
    onOpenChange,
    shiftTypes,
    onSave,
}: SchedulePresetDialogProps) {
    const t = useTranslations('schedule')

    const [activeTab, setActiveTab] = useState<'standard' | 'retail'>('standard')
    const [standard, setStandard] = useState<Omit<StandardPreset, 'mode'>>(defaultStandardPreset)
    const [retail, setRetail] = useState<Omit<RetailPreset, 'mode'>>(defaultRetailPreset)

    useEffect(() => {
        if (!open) return

        // Load standard preset
        try {
            const stored = localStorage.getItem(STORAGE_KEY_STANDARD)
            if (stored) {
                setStandard(JSON.parse(stored))
            } else {
                setStandard({ ...defaultStandardPreset, AllowedShiftTypeIds: shiftTypes.map(st => st.id) })
            }
        } catch {
            setStandard({ ...defaultStandardPreset, AllowedShiftTypeIds: shiftTypes.map(st => st.id) })
        }

        // Load retail preset
        try {
            const stored = localStorage.getItem(STORAGE_KEY_RETAIL)
            if (stored) {
                setRetail(JSON.parse(stored))
            } else {
                setRetail(defaultRetailPreset)
            }
        } catch {
            setRetail(defaultRetailPreset)
        }
    }, [open, shiftTypes])

    const handleSave = () => {
        if (activeTab === 'standard') {
            localStorage.setItem(STORAGE_KEY_STANDARD, JSON.stringify(standard))
            onSave({ mode: 'standard', ...standard })
        } else {
            localStorage.setItem(STORAGE_KEY_RETAIL, JSON.stringify(retail))
            onSave({ mode: 'retail', ...retail })
        }
        onOpenChange(false)
    }

    const toggleShiftType = (id: number) => {
        setStandard(prev => {
            const selected = prev.AllowedShiftTypeIds.includes(id)
            return {
                ...prev,
                AllowedShiftTypeIds: selected
                    ? prev.AllowedShiftTypeIds.filter(x => x !== id)
                    : [...prev.AllowedShiftTypeIds, id],
            }
        })
    }

    const getPatternLabel = (pattern: SchedulePattern): string => {
        switch (pattern) {
            case SchedulePattern.Custom: return t('patternCustom')
            case SchedulePattern.TwoOnTwoOff: return t('patternTwoOnTwoOff')
            case SchedulePattern.FiveOnTwoOff: return t('patternFiveOnTwoOff')
            case SchedulePattern.ThreeOnThreeOff: return t('patternThreeOnThreeOff')
            case SchedulePattern.FourOnFourOff: return t('patternFourOnFourOff')
            default: return 'Custom'
        }
    }

    const isSaveDisabled =
        activeTab === 'standard' && standard.AllowedShiftTypeIds.length === 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('schedulePresetTitle')}</DialogTitle>
                    <DialogDescription>{t('schedulePresetDescription')}</DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'standard' | 'retail')}>
                    <TabsList className="w-full">
                        <TabsTrigger value="standard" className="flex-1">{t('tabStandard')}</TabsTrigger>
                        <TabsTrigger value="retail" className="flex-1">{t('tabRetail')}</TabsTrigger>
                    </TabsList>

                    {/* Standard tab */}
                    <TabsContent value="standard">
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label>{t('schedulePattern')}</Label>
                                <Select
                                    value={standard.SchedulePattern.toString()}
                                    onValueChange={(v) =>
                                        setStandard(prev => ({ ...prev, SchedulePattern: parseInt(v) as SchedulePattern }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
                                            SchedulePattern.Custom,
                                            SchedulePattern.TwoOnTwoOff,
                                            SchedulePattern.FiveOnTwoOff,
                                            SchedulePattern.ThreeOnThreeOff,
                                            SchedulePattern.FourOnFourOff,
                                        ].map(p => (
                                            <SelectItem key={p} value={p.toString()}>
                                                {getPatternLabel(p)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('maxConsecutiveShifts')}</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={standard.MaxConsecutiveShifts}
                                    onChange={(e) =>
                                        setStandard(prev => ({ ...prev, MaxConsecutiveShifts: parseInt(e.target.value) || 1 }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('minDaysOffPerWeek')}</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="7"
                                    value={standard.MinDaysOffPerWeek}
                                    onChange={(e) =>
                                        setStandard(prev => ({ ...prev, MinDaysOffPerWeek: parseInt(e.target.value) || 0 }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('allowedShiftTypes')}</Label>
                                <div className="space-y-2 border rounded-md p-4 max-h-60 overflow-y-auto">
                                    {shiftTypes.map((st) => (
                                        <div key={st.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`shift-${st.id}`}
                                                checked={standard.AllowedShiftTypeIds.includes(st.id)}
                                                onCheckedChange={() => toggleShiftType(st.id)}
                                            />
                                            <label
                                                htmlFor={`shift-${st.id}`}
                                                className="text-sm font-medium leading-none cursor-pointer"
                                            >
                                                <span
                                                    className="inline-block w-4 h-4 rounded mr-2"
                                                    style={{ backgroundColor: st.color }}
                                                />
                                                {st.name} ({st.startTime} - {st.endTime})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {standard.AllowedShiftTypeIds.length === 0 && (
                                    <p className="text-sm text-red-500">{t('selectAtLeastOneShiftType')}</p>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Retail tab */}
                    <TabsContent value="retail">
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label>{t('totalHours')}</Label>
                                <p className="text-sm text-muted-foreground">{t('totalHoursHint')}</p>
                                <Input
                                    type="number"
                                    min="1"
                                    value={retail.totalHours}
                                    onChange={(e) =>
                                        setRetail(prev => ({ ...prev, totalHours: parseFloat(e.target.value) || 1 }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('maxConsecutiveShifts')}</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={retail.maxConsecutiveShifts}
                                    onChange={(e) =>
                                        setRetail(prev => ({ ...prev, maxConsecutiveShifts: parseInt(e.target.value) || 1 }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('minDaysOffPerWeek')}</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="7"
                                    value={retail.minDaysOffPerWeek}
                                    onChange={(e) =>
                                        setRetail(prev => ({ ...prev, minDaysOffPerWeek: parseInt(e.target.value) || 0 }))
                                    }
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleSave} disabled={isSaveDisabled}>
                        {t('savePreset')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
