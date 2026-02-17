import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {PersonalDayDto, PersonalDayRequestDto} from "@/types";
import api from "@/lib/api";
import {personalDayKeys, notificationKeys} from "@/lib/api-keys";

export const usePersonalDays = (employeeId: number) =>
    useQuery<PersonalDayDto[]>({
        queryKey: personalDayKeys.byEmployee(employeeId),
        queryFn: async () => {
            const { data } = await api.get(`personal-days/${employeeId}`);
            return data;
        },
    });

export const usePersonalDayRequests = (employeeId: number) =>
    useQuery<PersonalDayRequestDto[]>({
        queryKey: personalDayKeys.requests(employeeId),
        queryFn: async () => {
            const { data } = await api.get(`personal-days/requests/${employeeId}`);
            return data;
        },
    });

export const usePendingPersonalDayRequests = () =>
    useQuery<PersonalDayRequestDto[]>({
        queryKey: personalDayKeys.pendingRequests(),
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
            queryClient.invalidateQueries({ queryKey: personalDayKeys.byEmployee(employeeId) });
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
            queryClient.invalidateQueries({ queryKey: personalDayKeys.byEmployee(employeeId) });
        },
    });
};

export const useApprovePersonalDayRequest = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.post(`personal-days/employer/approve-request/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: personalDayKeys.pendingRequests() });
            qc.invalidateQueries({ queryKey: personalDayKeys.all });
            qc.invalidateQueries({ queryKey: notificationKeys.all });
            qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
};

export const useRejectPersonalDayRequest = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.post(`personal-days/employer/reject-request/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: personalDayKeys.pendingRequests() });
            qc.invalidateQueries({ queryKey: personalDayKeys.all });
            qc.invalidateQueries({ queryKey: notificationKeys.all });
            qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
};

export const useGetPersonalDays = (employeeId: number) => usePersonalDays(employeeId);
