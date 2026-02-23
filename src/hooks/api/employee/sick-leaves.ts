import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {SickLeaveDto, SickLeaveRequestCreateDto, SickLeaveRequestDto} from "@/types";
import api from "@/lib/api";
import {sickLeaveKeys, notificationKeys} from "@/lib/api-keys";

export const useSickLeaves = (employeeId: number) =>
    useQuery<SickLeaveDto[]>({
        queryKey: sickLeaveKeys.byEmployee(employeeId),
        queryFn: async () => {
            const { data } = await api.get(`sick-leaves/${employeeId}`);
            return data;
        },
    });

export const useSickLeaveRequests = (employeeId: number) =>
    useQuery<SickLeaveRequestDto[]>({
        queryKey: sickLeaveKeys.requests(employeeId),
        queryFn: async () => {
            const { data } = await api.get(`sick-leaves/requests/${employeeId}`);
            return data;
        },
    });


export const usePendingSickLeaveRequests = () =>
    useQuery<SickLeaveRequestDto[]>({
        queryKey: sickLeaveKeys.pendingRequests(),
        queryFn: async () => {
            const { data } = await api.get('sick-leaves/employer/pending-requests');
            return data;
        },
    });

export const useAddApprovedSickLeave = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (sickLeave: SickLeaveDto) => {
            const { data } = await api.post(`sick-leaves/employer/${employeeId}`, sickLeave);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sickLeaveKeys.byEmployee(employeeId) });
        },
    });
};

export const useDeleteSickLeave = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`sick-leaves/${employeeId}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sickLeaveKeys.byEmployee(employeeId) });
        },
    });
};

export const useAddSickLeaveRequest = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dto: SickLeaveRequestCreateDto) => {
            const { data } = await api.post(`sick-leaves/requests/${employeeId}`, dto);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sickLeaveKeys.requests(employeeId) });
        },
    });
};

export const useDeleteSickLeaveRequest = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`sick-leaves/requests/${employeeId}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sickLeaveKeys.requests(employeeId) });
        },
    });
};

export const useApproveSickLeaveRequest = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.post(`sick-leaves/employer/approve-request/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: sickLeaveKeys.pendingRequests() });
            qc.invalidateQueries({ queryKey: sickLeaveKeys.all });
            qc.invalidateQueries({ queryKey: notificationKeys.all });
            qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
};

export const useRejectSickLeaveRequest = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.post(`sick-leaves/employer/reject-request/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: sickLeaveKeys.pendingRequests() });
            qc.invalidateQueries({ queryKey: sickLeaveKeys.all });
            qc.invalidateQueries({ queryKey: notificationKeys.all });
            qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
};

export const useGetSickLeaves = (employeeId: number) => useSickLeaves(employeeId);
