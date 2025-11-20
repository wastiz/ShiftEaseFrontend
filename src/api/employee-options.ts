import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {PreferenceBundle, SickLeaveDto, VacationRequestDto, WeekDayPreferenceDto} from "@/types";

// Vacations
export const useVacations = () => {
    return useQuery<VacationRequestDto[]>({
        queryKey: ['vacations'],
        queryFn: async () => {
            const { data } = await api.get('employee-options/get-vacations');
            return data;
        },
    });
};

export const useAddVacation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (vacation: VacationRequestDto) => {
            const { data } = await api.post('employee-options/add-vacation-request', vacation);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacations'] });
        },
    });
};

export const useDeleteVacation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`employee-options/delete-vacation/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacations'] });
        },
    });
};

// Sick Leaves
export const useSickLeaves = () => {
    return useQuery<SickLeaveDto[]>({
        queryKey: ['sick-leaves'],
        queryFn: async () => {
            const { data } = await api.get('employee-options/get-sick-leaves');
            return data;
        },
    });
};

export const useAddSickLeave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (sickLeave: SickLeaveDto) => {
            const { data } = await api.post('employee-options/add-sick-leave', sickLeave);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sick-leaves'] });
        },
    });
};

export const useDeleteSickLeave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`employee-options/sick-leave/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sick-leaves'] });
        },
    });
};

// Preferences
export const usePreferences = () => {
    return useQuery<PreferenceBundle>({
        queryKey: ['preferences'],
        queryFn: async () => {
            const { data } = await api.get('employee-options/preferences');
            return data;
        },
    });
};

export const useSavePreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (preferences: PreferenceBundle) => {
            await api.post('employee-options/preferences', preferences);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preferences'] });
        },
    });
};

export const useWeekDays = () => {
    return useQuery<WeekDayPreferenceDto[]>({
        queryKey: ['week-days'],
        queryFn: async () => {
            const { data } = await api.get('employee-options/week-days');
            return data;
        },
    });
};
