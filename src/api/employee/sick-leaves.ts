import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {SickLeaveDto, SickLeaveRequestDto} from "@/types";
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
            const { data } = await api.post(`employer/sick-leaves/${employeeId}`, sickLeave);
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

export const useGetSickLeaves = (employeeId: number) => useSickLeaves(employeeId);
