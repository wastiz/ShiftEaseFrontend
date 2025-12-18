import {useQuery} from "@tanstack/react-query";
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
