'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/shadcn/button'
import {
    useExportSchedule,
    useGenerateRetailSchedule,
    useGenerateSchedule,
    useSaveSchedule,
    useScheduleManagementData,
    useUnconfirmSchedule
} from "@/hooks/api"
import Header from "@/components/ui/Header"
import {
    Shift,
    EmployeeTimeOff,
    SchedulePattern,
    GenerateStatus,
    GenerateErrorCode,
    GenerateWarningCode
} from "@/types/schedule"
import ScheduleCalendar from "@/components/features/schedules/ScheduleCalendar/ScheduleCalendar"
import { getDaysInMonth } from "@/helpers/dateHelper"
import Loader from "@/components/ui/Loader"
import { Holiday, WorkDay } from "@/types"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/shadcn/toggle-group"
import {Calendar, Download, List, Loader2, Settings} from "lucide-react"
import SimpleView from "@/components/features/schedules/ScheduleSimple/ScheduleSimple"
import { toast } from "sonner"
import { useTranslations } from 'next-intl'
import SchedulePresetDialog, {SchedulePreset} from "@/components/features/schedules/SchedulePresetDialog";
import GenerateResultDialog from "@/components/ui/GenerateResultDialog";
import {ButtonGroup} from "@/components/ui/shadcn/button-group";

const today = new Date()

const DEFAULT_MAX_CONSECUTIVE_SHIFTS = 5;
const DEFAULT_MIN_DAYS_OFF_PER_WEEK = 2;

export type MessageType = "warning" | "error";
export type WarningMessage = {
    message: string;
    messageType: MessageType
}

export default function ManageSchedule() {
    const t = useTranslations('schedule');

    const [viewMode, setViewMode] = useState<'calendar' | 'simple'>('simple');
    const [currentMonth, setCurrentMonth] = useState(today.getMonth())
    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [daysOfMonth, setDaysOfMonth] = useState(getDaysInMonth(today.getFullYear(), today.getMonth()))

    const [isConfirmed, setIsConfirmed] = useState(false)
    const [scheduleId, setScheduleId] = useState<number | null>(null)
    const [shiftsData, setShiftsData] = useState<Shift[]>([])
    const [orgHolidays, setOrgHolidays] = useState<Holiday[]>([])
    const [orgSchedule, setOrgSchedule] = useState<WorkDay[]>([])
    const [employeeTimeOffs, setEmployeeTimeOffs] = useState<EmployeeTimeOff[]>([])

    const [presetDialogOpen, setPresetDialogOpen] = useState(false)
    const [currentPreset, setCurrentPreset] = useState<SchedulePreset | null>(null)
    const [warningMessage, setWarningMessage] = useState<WarningMessage | null>(null)
    const [resultDialogOpen, setResultDialogOpen] = useState(false)
    const [generateResult, setGenerateResult] = useState<{
        status: GenerateStatus;
        error?: GenerateErrorCode;
        warnings?: GenerateWarningCode[];
    } | null>(null)

    useEffect(() => {
        setDaysOfMonth(getDaysInMonth(currentYear, currentMonth))
    }, [currentMonth, currentYear])

    const { data, isLoading, error } = useScheduleManagementData({
        month: currentMonth + 1,
        year: currentYear,
    })

    useEffect(() => {
        if (data) {
            console.log(data)
            setShiftsData(data.schedule?.shifts ?? [])
            setIsConfirmed(data.schedule?.isConfirmed ?? false)
            setScheduleId(data.schedule?.id ?? null)
            setOrgHolidays(data.organizationHolidays ?? [])
            setOrgSchedule(data.organizationSchedule ?? [])
            setEmployeeTimeOffs(data.employeeTimeOffs ?? [])
        }
    }, [data])

    const saveMutation = useSaveSchedule({
        startDate: daysOfMonth[0].isoDate,
        endDate: daysOfMonth[daysOfMonth.length - 1]?.isoDate,
        shiftsData,
    })

    const unconfirmMutation = useUnconfirmSchedule()
    const exportSchedule = useExportSchedule()
    const generateSchedule = useGenerateSchedule()
    const generateRetailSchedule = useGenerateRetailSchedule()

    const onGenerateResult = (result: { status: GenerateStatus; error?: GenerateErrorCode; warnings?: GenerateWarningCode[]; shifts?: Shift[] } | undefined) => {
        if (!result) return;

        setGenerateResult({
            status: result.status,
            error: result.error,
            warnings: result.warnings,
        });

        if (result.status === GenerateStatus.Error) {
            setResultDialogOpen(true);
            setWarningMessage({ message: t(`errors.${result.error}`), messageType: "error" });
        } else if (result.status === GenerateStatus.Warning) {
            setShiftsData(result.shifts ?? []);
            setIsConfirmed(false);
            setResultDialogOpen(true);
            const warningMessages = (result.warnings ?? []).map(w => t(`warnings.${w}`)).join("; ");
            setWarningMessage({ message: warningMessages, messageType: "warning" });
        } else {
            setShiftsData(result.shifts ?? []);
            setIsConfirmed(false);
            setWarningMessage(null);
            toast.success(t('generateSuccess'));
        }
    }

    const handleGenerate = () => {
        if (currentPreset?.mode === 'retail') {
            if (!scheduleId) {
                toast.error(t('retailRequiresSchedule'));
                return;
            }
            generateRetailSchedule.mutate(
                {
                    scheduleId,
                    totalHours: currentPreset.totalHours,
                    maxConsecutiveShifts: currentPreset.maxConsecutiveShifts,
                    minDaysOffPerWeek: currentPreset.minDaysOffPerWeek,
                },
                {
                    onSuccess: onGenerateResult,
                    onError: (error: any) => {
                        const message =
                            error?.response?.data?.error ||
                            error?.response?.data?.message ||
                            error?.message ||
                            "Something went wrong";

                        toast.error(message);
                    }
                }
            );
            return;
        }

        const preset = (currentPreset?.mode === 'standard' ? currentPreset : null) || {
            AllowedShiftTypeIds: data?.shiftTypes?.map(st => st.id) || [],
            MaxConsecutiveShifts: DEFAULT_MAX_CONSECUTIVE_SHIFTS,
            SchedulePattern: SchedulePattern.Custom,
            MinDaysOffPerWeek: DEFAULT_MIN_DAYS_OFF_PER_WEEK,
        }

        generateSchedule.mutate(
            {
                startDate: daysOfMonth[0].isoDate,
                endDate: daysOfMonth[daysOfMonth.length - 1]?.isoDate,
                AllowedShiftTypeIds: preset.AllowedShiftTypeIds,
                MaxConsecutiveShifts: preset.MaxConsecutiveShifts,
                SchedulePattern: preset.SchedulePattern,
                MinDaysOffPerWeek: preset.MinDaysOffPerWeek,
            },
            {
                onSuccess: onGenerateResult,
                onError: () => toast.error(t('generateError')),
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

    const handleExport = () => {
        if (!scheduleId) return
        exportSchedule.mutate(scheduleId, {
            onSuccess: () => toast.success(t('exportSuccess')),
            onError: () => toast.error(t('exportFailed')),
        })
    }

    if (isLoading) return <Loader />
    if (error) return <p className="p-4 text-red-500">{t('failedToLoad')}</p>

    return (
        <>
            <Header title={t('manageSchedule')}>
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
                        <Button onClick={handleGenerate} disabled={generateSchedule.isPending || generateRetailSchedule.isPending}>
                            {(generateSchedule.isPending || generateRetailSchedule.isPending) ? t('generating') : t('generateSchedule')}
                        </Button>
                    </ButtonGroup>
                </div>
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
                <Button onClick={handleExport} disabled={exportSchedule.isPending || !scheduleId}>
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
                    shiftTypes={data?.shiftTypes ?? []}
                    employees={data?.employees ?? []}
                    groups={data?.groups ?? []}
                    daysOfMonth={daysOfMonth}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    setCurrentMonth={setCurrentMonth}
                    setCurrentYear={setCurrentYear}
                    isConfirmed={isConfirmed}
                    isEditable={true}
                    orgHolidays={orgHolidays}
                    orgSchedule={orgSchedule}
                    employeeTimeOffs={employeeTimeOffs}
                    warningMessage={null}
                />
            ) : (
                <SimpleView
                    employees={data?.employees ?? []}
                    shiftTypes={data?.shiftTypes ?? []}
                    groups={data?.groups ?? []}
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
                    warningMessage={null}
                />
            )}

            <SchedulePresetDialog
                open={presetDialogOpen}
                onOpenChange={setPresetDialogOpen}
                shiftTypes={data?.shiftTypes || []}
                onSave={handleSavePreset}
            />

            {generateResult && (
                <GenerateResultDialog
                    open={resultDialogOpen}
                    onOpenChange={setResultDialogOpen}
                    status={generateResult.status}
                    error={generateResult.error}
                    warnings={generateResult.warnings}
                />
            )}
        </>
    )
}
