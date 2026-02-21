import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import api from "@/lib/api";
import {toast} from "sonner";
import {
    Schedule,
    ScheduleEditorData,
    ScheduleGenerateRequest,
    ScheduleGenerateResult,
    SchedulePost,
    ScheduleRequest,
    ScheduleSummary,
    Shift
} from "@/types";
import {scheduleKeys} from "@/lib/api-keys";

export function useGetConfirmedSchedule(month: number, year: number, groupId: number) {
    return useQuery<Schedule>({
        queryKey: scheduleKeys.confirmed(month, year),
        queryFn: async () => {
            const res = await api.get<Schedule>("/schedules/confirmed", {
                params: {
                    groupId,
                    month,
                    year
                },
            });
            return res.data;
        }
    });
}

export function useScheduleSummaries(enabled: boolean) {
    return useQuery<ScheduleSummary[]>({
        queryKey: scheduleKeys.all,
        queryFn: async () => {
            const { data } = await api.get<ScheduleSummary[]>('/schedules/schedule-summaries');
            return data;
        },
        enabled,
    });
}

type ScheduleDataResponse = ScheduleEditorData & {
    schedule: Schedule;
};

export function useScheduleData({ groupId, month, year }: ScheduleRequest) {
    return useQuery<ScheduleDataResponse>({
        queryKey: scheduleKeys.data(groupId, month, year),
        queryFn: async () => {
            const base = await api.get<ScheduleEditorData>(`/schedules/schedule-data-for-managing/${groupId}`);

            const schedule = await api.get<Schedule>('/schedules/schedule-info-with-shifts', {
                params: {
                    groupId,
                    month: month + 1,
                    year,
                    showOnlyConfirmed: false,
                }
            });

            return { ...base.data, schedule: schedule.data };
        },
    });
}

type SaveScheduleParams = {
    groupId: number;
    autorenewal: boolean;
    startDate: string;
    endDate: string;
    shiftsData: Shift[];
};

export function useSaveSchedule({ groupId, autorenewal, startDate, endDate, shiftsData }: SaveScheduleParams) {
    const queryClient = useQueryClient();


    return useMutation<void, Error, boolean>({
        mutationFn: async (isConfirmed: boolean) => {
            const payload: SchedulePost = {
                groupId,
                startDate,
                endDate,
                autorenewal,
                isConfirmed,
                shifts: shiftsData.map((s) => ({
                    shiftTypeId: s.shiftTypeId,
                    date: s.date,
                    employees: s.employees.map((e) => ({
                        id: e.id,
                        note: e.note || "",
                    })),
                })),
            };

            await api.post('/schedules/update-schedule', payload);
        },
        onSuccess: () => {
            toast.success('Schedule saved!');
            queryClient.invalidateQueries({ queryKey: scheduleKeys.dataAll() });
        },
        onError: (error: any) => {
            const message =
                error.response?.data ||
                "Failed to save schedule"

            toast.error(message)
        }
    });
}

export function useUnconfirmSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (scheduleId: number) => {
            const response = await api.post(`/schedules/unconfirm/${scheduleId}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Schedule unconfirmed!');
            queryClient.invalidateQueries({ queryKey: scheduleKeys.dataAll() });
        },
        onError: () => {
            toast.error('Failed to unconfirm schedule');
        },
    });
}

export function useGenerateSchedule() {
    const queryClient = useQueryClient();

    return useMutation<ScheduleGenerateResult, Error, Omit<ScheduleGenerateRequest, 'id'>>({
        mutationFn: async ({
            groupId,
            startDate,
            endDate,
            AllowedShiftTypeIds,
            MaxConsecutiveShifts,
            SchedulePattern,
            MinDaysOffPerWeek
        }) => {
            const response = await api.post<ScheduleGenerateResult>('/schedule-generator/generate', {
                groupId,
                startDate,
                endDate,
                AllowedShiftTypeIds,
                MaxConsecutiveShifts,
                SchedulePattern,
                MinDaysOffPerWeek
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.dataAll() });
        },
    });
}

export function useExportSchedule() {
    return useMutation({
        mutationFn: async (scheduleId: number) => {
            const response = await api.get(`/schedules/export/${scheduleId}`, {
                responseType: 'blob'
            });
            return response.data;
        },
        onSuccess: (data, scheduleId) => {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `schedule_${scheduleId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }
    });
}
