import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {PersonalDayDto, PersonalDayRequestDto} from "@/types";
import api from "@/lib/api";

export const usePersonalDays = (employeeId: number) =>
    useQuery<PersonalDayDto[]>({
        queryKey: ['personal-days', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`personal-days/${employeeId}`);
            return data;
        },
    });

export const usePersonalDayRequests = (employeeId: number) =>
    useQuery<PersonalDayRequestDto[]>({
        queryKey: ['personal-day-requests', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`personal-days/requests/${employeeId}`);
            return data;
        },
    });

export const usePendingPersonalDayRequests = () =>
    useQuery<PersonalDayRequestDto[]>({
        queryKey: ['pending-personal-day-requests'],
        queryFn: async () => {
            const { data } = await api.get('personal-days/employer/pending-requests');
            return data;
        },
    });

export const useDeletePersonalDay = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`personal-days/${employeeId}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['personal-days', employeeId] });
        },
    });
};

export const useAddApprovedPersonalDay = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (personalDay: PersonalDayDto) => {
            const { data } = await api.post(`personal-days/employer/${employeeId}`, personalDay);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['personal-days', employeeId] });
        },
    });
};

export const useApprovePersonalDayRequest = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.post(`personal-days/employer/approve-request/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pending-personal-day-requests'] });
            qc.invalidateQueries({ queryKey: ['personal-days'] });
            qc.invalidateQueries({ queryKey: ['notifications'] });
            qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        },
    });
};

export const useRejectPersonalDayRequest = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.post(`personal-days/employer/reject-request/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pending-personal-day-requests'] });
            qc.invalidateQueries({ queryKey: ['personal-days'] });
            qc.invalidateQueries({ queryKey: ['notifications'] });
            qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        },
    });
};

export const useGetPersonalDays = (employeeId: number) => usePersonalDays(employeeId);

