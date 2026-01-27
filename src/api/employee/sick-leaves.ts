import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {SickLeaveDto, SickLeaveRequestCreateDto, SickLeaveRequestDto} from "@/types";
import api from "@/lib/api";

export const useSickLeaves = (employeeId: number) =>
    useQuery<SickLeaveDto[]>({
        queryKey: ['sick-leaves', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`sick-leaves/${employeeId}`);
            return data;
        },
    });

export const useSickLeaveRequests = (employeeId: number) =>
    useQuery<SickLeaveRequestDto[]>({
        queryKey: ['sick-leave-requests', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`sick-leaves/requests/${employeeId}`);
            return data;
        },
    });


export const usePendingSickLeaveRequests = () =>
    useQuery<SickLeaveRequestDto[]>({
        queryKey: ['pending-sick-leave-requests'],
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
            queryClient.invalidateQueries({ queryKey: ['sick-leaves', employeeId] });
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
            queryClient.invalidateQueries({ queryKey: ['sick-leaves', employeeId] });
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
            queryClient.invalidateQueries({ queryKey: ['sick-leave-requests', employeeId] });
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
            queryClient.invalidateQueries({ queryKey: ['sick-leave-requests', employeeId] });
        },
    });
};

export const useApproveSickLeaveRequest = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.post(`sick-leaves/employer/approve-request/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pending-sick-leave-requests'] });
            qc.invalidateQueries({ queryKey: ['sick-leaves'] });
            qc.invalidateQueries({ queryKey: ['notifications'] });
            qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        },
    });
};

export const useRejectSickLeaveRequest = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.post(`sick-leaves/employer/reject-request/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pending-sick-leave-requests'] });
            qc.invalidateQueries({ queryKey: ['sick-leaves'] });
            qc.invalidateQueries({ queryKey: ['notifications'] });
            qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        },
    });
};

export const useGetSickLeaves = (employeeId: number) => useSickLeaves(employeeId);
