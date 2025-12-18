import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {PreferenceBundle, WeekDayPreferenceDto} from "@/types";
import api from "@/lib/api";

export const usePreferences = (employeeId: number) =>
    useQuery<PreferenceBundle>({
        queryKey: ['preferences', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`preferences/${employeeId}`);
            return data;
        },
    });

export const useSavePreferences = (employeeId: number) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (dto: PreferenceBundle) =>
            api.post(`preferences/${employeeId}`, dto),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ['preferences', employeeId] }),
    });
};

export const useWeekDays = (employeeId: number) =>
    useQuery<WeekDayPreferenceDto[]>({
        queryKey: ['week-days', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`preferences/week-days/${employeeId}`);
            return data;
        },
    });
