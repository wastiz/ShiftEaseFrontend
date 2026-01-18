'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/shadcn/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select'
import { useParams } from "next/navigation"
import {useExportSchedule, useGenerateSchedule, useSaveSchedule, useScheduleData, useUnconfirmSchedule} from "@/api"
import Header from "@/modules/Header"
import { Shift, SchedulePattern, EmployeeTimeOff } from "@/types/schedule"
import ScheduleCalendar from "@/modules/ScheduleCalendar/ScheduleCalendar"
import { getDaysInMonth } from "@/helpers/dateHelper"
import Loader from "@/components/ui/Loader"
import {Holiday, WorkDay} from "@/types";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/shadcn/toggle-group";
import {Calendar, Download, List, Loader2, Settings} from "lucide-react";
import SimpleView from "@/modules/ScheduleSimple/ScheduleSimple";
import {toast} from "sonner";
import { useTranslations } from 'next-intl';
import SchedulePresetDialog, { SchedulePreset } from "@/modules/page-modules/schedules/SchedulePresetDialog";
import { ButtonGroup } from '@/components/ui/shadcn/button-group'

const today = new Date()

export default function ManageSchedule() {
    const t = useTranslations('schedule');
    const params = useParams()
    const groupId = Number(params.groupId)

    const [viewMode, setViewMode] = useState<'calendar' | 'simple'>('simple');
    const [currentMonth, setCurrentMonth] = useState(today.getMonth())
    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [daysOfMonth, setDaysOfMonth] = useState(getDaysInMonth(today.getFullYear(), today.getMonth()))
    const [selectedGroupId, setSelectedGroupId] = useState<number>(groupId)
    const [autorenewal, setAutorenewal] = useState(false)
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [scheduleId, setScheduleId] = useState<number | null>(null)
    const [shiftsData, setShiftsData] = useState<Shift[]>([])
    const [orgHolidays, setOrgHolidays] = useState<Holiday[]>([])
    const [orgSchedule, setOrgSchedule] = useState<WorkDay[]>([])
    const [employeeTimeOffs, setEmployeeTimeOffs] = useState<EmployeeTimeOff[]>([])
    const [presetDialogOpen, setPresetDialogOpen] = useState(false)
    const [currentPreset, setCurrentPreset] = useState<SchedulePreset | null>(null)

    useEffect(() => {
        setDaysOfMonth(getDaysInMonth(currentYear, currentMonth))
    }, [currentMonth, currentYear])

    const { data, isLoading, error } = useScheduleData({
        groupId: selectedGroupId,
        month: currentMonth,
        year: currentYear,
        showOnlyConfirmed: false,
    })

    useEffect(() => {
        if (data?.schedule) {
            setShiftsData(data.schedule.shifts || [])
            setIsConfirmed(data.schedule.isConfirmed || false)
            setScheduleId(data.schedule.id || null)
            setOrgHolidays(data.schedule.organizationHolidays || [])
            setOrgSchedule(data.schedule.organizationSchedule || [])
            setEmployeeTimeOffs(data.schedule.employeeTimeOffs || [])
        }
    }, [data])

    const saveMutation = useSaveSchedule({
        groupId: selectedGroupId,
        startDate: daysOfMonth[0].isoDate,
        endDate: daysOfMonth[daysOfMonth.length - 1]?.isoDate,
        autorenewal,
        shiftsData,
    })

    const unconfirmMutation = useUnconfirmSchedule()
    const generateSchedule = useGenerateSchedule()

    // Load preset from localStorage on mount or when groupId changes
    useEffect(() => {
        const storageKey = `schedule_preset_${selectedGroupId}`
        const stored = localStorage.getItem(storageKey)
        if (stored) {
            try {
                const parsedPreset = JSON.parse(stored)
                setCurrentPreset(parsedPreset)
            } catch (e) {
                console.error('Failed to parse stored preset', e)
                setCurrentPreset(null)
            }
        } else {
            setCurrentPreset(null)
        }
    }, [selectedGroupId])

    const handleGenerate = () => {
        // Use preset if available, otherwise use default values
        const preset = currentPreset || {
            AllowedShiftTypeIds: data?.shiftTypes?.map(st => st.id) || [],
            MaxConsecutiveShifts: 5,
            SchedulePattern: SchedulePattern.Custom,
            MinDaysOffPerWeek: 2
        }

        generateSchedule.mutate(
            {
                groupId: selectedGroupId,
                startDate: daysOfMonth[0].isoDate,
                endDate: daysOfMonth[daysOfMonth.length - 1]?.isoDate,
                AllowedShiftTypeIds: preset.AllowedShiftTypeIds,
                MaxConsecutiveShifts: preset.MaxConsecutiveShifts,
                SchedulePattern: preset.SchedulePattern,
                MinDaysOffPerWeek: preset.MinDaysOffPerWeek
            },
            {
                onSuccess: (responseData) => {
                    if (responseData) {
                        toast.success(responseData.message)
                        setShiftsData(responseData.data.shifts)
                        setIsConfirmed(false)
                    }
                }
            }
        )
    }

    const handleSavePreset = (preset: SchedulePreset) => {
        setCurrentPreset(preset)
        toast.success(t('presetSaved'))
    }

    const handleConfirmToggle = () => {
        if (isConfirmed && scheduleId) {
            unconfirmMutation.mutate(scheduleId)
        } else {
            saveMutation.mutate(true)
        }
    }

    const exportSchedule = useExportSchedule();

    const handleExport = () => {
        exportSchedule.mutate(scheduleId, {
            onSuccess: () => {
                toast.success(t('exportSuccess'));
            },
            onError: () => {
                toast.error(t('exportFailed'));
            }
        });
    };

    if (isLoading) return <Loader />
    if (error) return <p className="p-4 text-red-500">{t('failedToLoad')}</p>

    return (
        <>
            <Header title={t('manageSchedule')}>
                <Select value={selectedGroupId.toString()} onValueChange={(v) => setSelectedGroupId(Number(v))}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder={t('selectGroup')} />
                    </SelectTrigger>
                    <SelectContent>
                        {data?.groups?.map((g) => (
                            <SelectItem key={g.id} value={g.id.toString()}>
                                {g.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(value) => value && setViewMode(value as "calendar" | "simple")}
                    className="ml-auto"
                >
                    <ToggleGroupItem value="simple" aria-label={t('simpleView')}>
                        <List className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="calendar" aria-label={t('calendarView')}>
                        <Calendar className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
                <div className="flex gap-2">
                    <ButtonGroup>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPresetDialogOpen(true)}
                            title={t('presetSettings')}
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                        <Button onClick={handleGenerate} disabled={generateSchedule.isPending}>
                            {generateSchedule.isPending ? t('generating') : t('generateSchedule')}
                        </Button>
                    </ButtonGroup>
                </div>
                <Button onClick={() => saveMutation.mutate(false)} disabled={saveMutation.isPending}>
                    {t('save')}
                </Button>
                <Button
                    onClick={handleConfirmToggle}
                    disabled={saveMutation.isPending || unconfirmMutation.isPending}
                    variant={isConfirmed ? "outline" : "default"}
                >
                    {isConfirmed ? t('unconfirm') : t('confirm')}
                </Button>
                <Button onClick={handleExport} disabled={exportSchedule.isPending}>
                    {exportSchedule.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    {t('exportToExcel')}
                </Button>
            </Header>

            {viewMode === 'calendar' ? (
                <ScheduleCalendar
                    shiftsData={shiftsData}
                    setShiftsData={setShiftsData}
                    shiftTypes={data?.shiftTypes || []}
                    employees={data?.employees || []}
                    daysOfMonth={daysOfMonth}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    setCurrentMonth={setCurrentMonth}
                    setCurrentYear={setCurrentYear}
                    autorenewal={autorenewal}
                    setAutorenewal={setAutorenewal}
                    isConfirmed={isConfirmed}
                    isEditable={true}
                    orgHolidays={orgHolidays}
                    orgSchedule={orgSchedule}
                    employeeTimeOffs={employeeTimeOffs}
                />
            ) : (
                <SimpleView
                    employees={data?.employees || []}
                    shiftTypes={data?.shiftTypes || []}
                    shiftsData={shiftsData}
                    setShiftsData={setShiftsData}
                    daysOfMonth={daysOfMonth}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    setCurrentMonth={setCurrentMonth}
                    setCurrentYear={setCurrentYear}
                    isConfirmed={isConfirmed}
                    orgHolidays={orgHolidays}
                    orgSchedule={orgSchedule}
                    employeeTimeOffs={employeeTimeOffs}
                />
            )}

            <SchedulePresetDialog
                open={presetDialogOpen}
                onOpenChange={setPresetDialogOpen}
                shiftTypes={data?.shiftTypes || []}
                groupId={selectedGroupId}
                onSave={handleSavePreset}
            />
        </>
    )
}
