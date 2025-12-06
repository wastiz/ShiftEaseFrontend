import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    PreferenceBundle,
    VacationDto,
    VacationRequestDto,
    SickLeaveDto,
    SickLeaveRequestDto,
    PersonalDayDto,
    PersonalDayRequestDto,
    WeekDayPreferenceDto
} from "@/types";

// ==================== FOR EMPLOYEES (accessing their own data) ====================

// Vacations
export const useVacations = () => {
    return useQuery<VacationRequestDto[]>({
        queryKey: ['vacations-self'],
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
            queryClient.invalidateQueries({ queryKey: ['vacations-self'] });
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
            queryClient.invalidateQueries({ queryKey: ['vacations-self'] });
        },
    });
};

// Sick Leaves
export const useSickLeaves = () => {
    return useQuery<SickLeaveDto[]>({
        queryKey: ['sick-leaves-self'],
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
            queryClient.invalidateQueries({ queryKey: ['sick-leaves-self'] });
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
            queryClient.invalidateQueries({ queryKey: ['sick-leaves-self'] });
        },
    });
};

// Preferences
export const usePreferences = () => {
    return useQuery<PreferenceBundle>({
        queryKey: ['preferences-self'],
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
            queryClient.invalidateQueries({ queryKey: ['preferences-self'] });
        },
    });
};

// ==================== FOR EMPLOYERS (managing specific employee's data) ====================

// Vacations (Approved)
export const useEmployeeVacations = (employeeId: number) => {
    return useQuery<VacationDto[]>({
        queryKey: ['vacations', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`employee-options/vacations/${employeeId}`);
            return data;
        },
    });
};

export const useDeleteEmployeeVacation = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`employee-options/vacations/${employeeId}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacations', employeeId] });
        },
    });
};

// Vacation Requests
export const useEmployeeVacationRequests = (employeeId: number) => {
    return useQuery<VacationRequestDto[]>({
        queryKey: ['vacation-requests', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`employee-options/vacation-requests/${employeeId}`);
            return data;
        },
    });
};

export const useAddEmployeeVacationRequest = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (vacation: VacationRequestDto) => {
            const { data } = await api.post(`employee-options/vacation-requests/${employeeId}`, vacation);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacation-requests', employeeId] });
        },
    });
};

export const useDeleteEmployeeVacationRequest = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`employee-options/vacation-requests/${employeeId}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacation-requests', employeeId] });
        },
    });
};

// Sick Leaves (Approved)
export const useEmployeeSickLeaves = (employeeId: number) => {
    return useQuery<SickLeaveDto[]>({
        queryKey: ['sick-leaves', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`employee-options/sick-leaves/${employeeId}`);
            return data;
        },
    });
};

export const useDeleteEmployeeSickLeave = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`employee-options/sick-leaves/${employeeId}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sick-leaves', employeeId] });
        },
    });
};

// Sick Leave Requests
export const useEmployeeSickLeaveRequests = (employeeId: number) => {
    return useQuery<SickLeaveRequestDto[]>({
        queryKey: ['sick-leave-requests', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`employee-options/sick-leave-requests/${employeeId}`);
            return data;
        },
    });
};

export const useAddEmployeeSickLeaveRequest = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (sickLeave: SickLeaveRequestDto) => {
            const { data } = await api.post(`employee-options/sick-leave-requests/${employeeId}`, sickLeave);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sick-leave-requests', employeeId] });
        },
    });
};

export const useDeleteEmployeeSickLeaveRequest = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`employee-options/sick-leave-requests/${employeeId}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sick-leave-requests', employeeId] });
        },
    });
};

// Personal Days (Approved)
export const useEmployeePersonalDays = (employeeId: number) => {
    return useQuery<PersonalDayDto[]>({
        queryKey: ['personal-days', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`employee-options/personal-days/${employeeId}`);
            return data;
        },
    });
};

export const useDeleteEmployeePersonalDay = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`employee-options/personal-days/${employeeId}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['personal-days', employeeId] });
        },
    });
};

// Personal Day Requests
export const useEmployeePersonalDayRequests = (employeeId: number) => {
    return useQuery<PersonalDayRequestDto[]>({
        queryKey: ['personal-day-requests', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`employee-options/personal-day-requests/${employeeId}`);
            return data;
        },
    });
};

export const useAddEmployeePersonalDayRequest = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (personalDay: PersonalDayRequestDto) => {
            const { data } = await api.post(`employee-options/personal-day-requests/${employeeId}`, personalDay);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['personal-day-requests', employeeId] });
        },
    });
};

export const useDeleteEmployeePersonalDayRequest = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`employee-options/personal-day-requests/${employeeId}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['personal-day-requests', employeeId] });
        },
    });
};

// ==================== EMPLOYER ENDPOINTS ====================

// Get pending requests (for entire organization)
export const useGetPendingVacationRequests = () => {
    return useQuery<VacationRequestDto[]>({
        queryKey: ['pending-vacation-requests'],
        queryFn: async () => {
            const { data } = await api.get('employee-options/employer/pending-vacation-requests');
            return data;
        },
    });
};

export const useGetPendingSickLeaveRequests = () => {
    return useQuery<SickLeaveRequestDto[]>({
        queryKey: ['pending-sick-leave-requests'],
        queryFn: async () => {
            const { data } = await api.get('employee-options/employer/pending-sick-leave-requests');
            return data;
        },
    });
};

export const useGetPendingPersonalDayRequests = () => {
    return useQuery<PersonalDayRequestDto[]>({
        queryKey: ['pending-personal-day-requests'],
        queryFn: async () => {
            const { data } = await api.get('employee-options/employer/pending-personal-day-requests');
            return data;
        },
    });
};

// Approve requests
export const useApproveVacationRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (requestId: number) => {
            await api.post(`employee-options/employer/approve-vacation-request/${requestId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-vacation-requests'] });
            queryClient.invalidateQueries({ queryKey: ['vacation-requests'] });
            queryClient.invalidateQueries({ queryKey: ['vacations'] });
        },
    });
};

export const useApproveSickLeaveRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (requestId: number) => {
            await api.post(`employee-options/employer/approve-sick-leave-request/${requestId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-sick-leave-requests'] });
            queryClient.invalidateQueries({ queryKey: ['sick-leave-requests'] });
            queryClient.invalidateQueries({ queryKey: ['sick-leaves'] });
        },
    });
};

export const useApprovePersonalDayRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (requestId: number) => {
            await api.post(`employee-options/employer/approve-personal-day-request/${requestId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-personal-day-requests'] });
            queryClient.invalidateQueries({ queryKey: ['personal-day-requests'] });
            queryClient.invalidateQueries({ queryKey: ['personal-days'] });
        },
    });
};

// Reject requests
export const useRejectVacationRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (requestId: number) => {
            await api.post(`employee-options/employer/reject-vacation-request/${requestId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-vacation-requests'] });
            queryClient.invalidateQueries({ queryKey: ['vacation-requests'] });
        },
    });
};

export const useRejectSickLeaveRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (requestId: number) => {
            await api.post(`employee-options/employer/reject-sick-leave-request/${requestId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-sick-leave-requests'] });
            queryClient.invalidateQueries({ queryKey: ['sick-leave-requests'] });
        },
    });
};

export const useRejectPersonalDayRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (requestId: number) => {
            await api.post(`employee-options/employer/reject-personal-day-request/${requestId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-personal-day-requests'] });
            queryClient.invalidateQueries({ queryKey: ['personal-day-requests'] });
        },
    });
};

// Add approved days directly (employer only)
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

export const useAddApprovedSickLeave = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (sickLeave: SickLeaveDto) => {
            const { data } = await api.post(`employee-options/employer/sick-leaves/${employeeId}`, sickLeave);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sick-leaves', employeeId] });
        },
    });
};

export const useAddApprovedPersonalDay = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (personalDay: PersonalDayDto) => {
            const { data } = await api.post(`employee-options/employer/personal-days/${employeeId}`, personalDay);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['personal-days', employeeId] });
        },
    });
};

// Preferences (for specific employee)
export const useEmployeePreferences = (employeeId: number) => {
    return useQuery<PreferenceBundle>({
        queryKey: ['preferences', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`employee-options/preferences/${employeeId}`);
            return data;
        },
    });
};

export const useSaveEmployeePreferences = (employeeId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (preferences: PreferenceBundle) => {
            await api.post(`employee-options/preferences/${employeeId}`, preferences);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preferences', employeeId] });
        },
    });
};

export const useEmployeeWeekDays = (employeeId: number) => {
    return useQuery<WeekDayPreferenceDto[]>({
        queryKey: ['week-days', employeeId],
        queryFn: async () => {
            const { data } = await api.get(`employee-options/week-days/${employeeId}`);
            return data;
        },
    });
};

// Convenience hooks that use the GET endpoints for vacations/sick leaves/personal days
export const useGetVacations = (employeeId: number) => useEmployeeVacations(employeeId);
export const useGetSickLeaves = (employeeId: number) => useEmployeeSickLeaves(employeeId);
export const useGetPersonalDays = (employeeId: number) => useEmployeePersonalDays(employeeId);
export const useGetDeleteVacation = (employeeId: number) => useDeleteEmployeeVacation(employeeId);
export const useGetDeleteSickLeave = (employeeId: number) => useDeleteEmployeeSickLeave(employeeId);
export const useGetDeletePersonalDay = (employeeId: number) => useDeleteEmployeePersonalDay(employeeId);
