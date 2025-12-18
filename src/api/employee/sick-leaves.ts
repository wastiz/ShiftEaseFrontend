import {useQuery} from "@tanstack/react-query";
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
