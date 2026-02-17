import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import api from "@/lib/api";
import {VacationDto, VacationRequestCreateDto, VacationRequestDto} from "@/types";
import {vacationKeys, notificationKeys} from "@/lib/api-keys";

export const useEmployeeVacations = (employeeId: number) =>
    useQuery<VacationDto[]>({
        queryKey: vacationKeys.byEmployee(employeeId),
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
            qc.invalidateQueries({ queryKey: vacationKeys.byEmployee(employeeId) }),
    });
};

export const useVacationRequests = (employeeId: number) =>
    useQuery<VacationRequestDto[]>({
        queryKey: vacationKeys.requests(employeeId),
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
            qc.invalidateQueries({ queryKey: vacationKeys.requests(employeeId) }),
    });
};

export const useDeleteVacationRequest = (employeeId: number) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.delete(`vacations/requests/${employeeId}/${id}`),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: vacationKeys.requests(employeeId) }),
    });
};

//Employer hooks
export const usePendingVacationRequests = () =>
    useQuery<VacationRequestDto[]>({
        queryKey: vacationKeys.pendingRequests(),
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
            qc.invalidateQueries({ queryKey: vacationKeys.pendingRequests() });
            qc.invalidateQueries({ queryKey: vacationKeys.all });
            qc.invalidateQueries({ queryKey: notificationKeys.all });
            qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
};

export const useAddApprovedVacation = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (vacation: VacationDto) => {
            const { data } = await api.post(`vacations/employer/${employeeId}`, vacation);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vacationKeys.byEmployee(employeeId) });
        },
    });
};

export const useRejectVacationRequest = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            api.post(`vacations/employer/reject-request/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: vacationKeys.pendingRequests() });
            qc.invalidateQueries({ queryKey: vacationKeys.all });
            qc.invalidateQueries({ queryKey: notificationKeys.all });
            qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
};

export const useGetVacations = (employeeId: number) => useEmployeeVacations(employeeId);
