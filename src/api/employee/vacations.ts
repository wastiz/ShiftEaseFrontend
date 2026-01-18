import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import api from "@/lib/api";
import {VacationDto, VacationRequestCreateDto, VacationRequestDto} from "@/types";

export const useEmployeeVacations = (employeeId: number) =>
    useQuery<VacationDto[]>({
        queryKey: ['vacations', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`vacations/${employeeId}`);
            return data;
        },
    });

export const useDeleteVacation = (employeeId: number) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.delete(`vacations/${employeeId}/${id}`),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ['vacations', employeeId] }),
    });
};

export const useVacationRequests = (employeeId: number) =>
    useQuery<VacationRequestDto[]>({
        queryKey: ['vacation-requests', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`vacations/requests/${employeeId}`);
            return data;
        },
    });

export const useAddVacationRequest = (employeeId: number) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (dto: VacationRequestCreateDto) =>
            api.post(`vacations/requests/${employeeId}`, dto),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ['vacation-requests', employeeId] }),
    });
};

export const useDeleteVacationRequest = (employeeId: number) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.delete(`vacations/requests/${employeeId}/${id}`),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ['vacation-requests', employeeId] }),
    });
};

//Employer hooks
export const usePendingVacationRequests = () =>
    useQuery<VacationRequestDto[]>({
        queryKey: ['pending-vacation-requests'],
        queryFn: async () => {
            const { data } = await api.get('vacations/employer/pending-requests');
            return data;
        },
    });

export const useApproveVacationRequest = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.post(`vacations/employer/approve-request/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pending-vacation-requests'] });
            qc.invalidateQueries({ queryKey: ['vacations'] });
        },
    });
};

export const useAddApprovedVacation = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (vacation: VacationDto) => {
            const { data } = await api.post(`employee-options/employer/vacations/${employeeId}`, vacation);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacations', employeeId] });
        },
    });
};

export const useGetVacations = (employeeId: number) => useEmployeeVacations(employeeId);

