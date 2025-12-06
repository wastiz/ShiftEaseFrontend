import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { VacationRequestDto, SickLeaveDto } from "@/types/employee-options";
import { toast } from "sonner";

const getOrgId = () => localStorage.getItem("orgId") ?? "";

export function useGetVacations(employeeId: number) {
    return useQuery({
        queryKey: ["vacations", employeeId],
        queryFn: async () => {
            const res = await api.get<VacationRequestDto[]>(`/employee-options/get-vacations/${employeeId}`, {
                headers: { "X-Organization-Id": getOrgId() },
            });
            return res.data;
        },
        enabled: !!employeeId,
    });
}

export function useAddVacation(employeeId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (vacation: VacationRequestDto) => {
            const res = await api.post(`/employee-options/add-vacation-request/${employeeId}`, vacation, {
                headers: { "X-Organization-Id": getOrgId() },
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Vacation added successfully");
            queryClient.invalidateQueries({ queryKey: ["vacations", employeeId] });
        },
        onError: () => {
            toast.error("Failed to add vacation");
        },
    });
}

export function useDeleteVacation(employeeId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (vacationId: number) => {
            await api.delete(`/employee-options/delete-vacation/${employeeId}/${vacationId}`, {
                headers: { "X-Organization-Id": getOrgId() },
            });
        },
        onSuccess: () => {
            toast.success("Vacation deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["vacations", employeeId] });
        },
        onError: () => {
            toast.error("Failed to delete vacation");
        },
    });
}

export function useGetSickLeaves(employeeId: number) {
    return useQuery({
        queryKey: ["sickLeaves", employeeId],
        queryFn: async () => {
            const res = await api.get<SickLeaveDto[]>(`/employee-options/get-sick-leaves/${employeeId}`, {
                headers: { "X-Organization-Id": getOrgId() },
            });
            return res.data;
        },
        enabled: !!employeeId,
    });
}

export function useAddSickLeave(employeeId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sickLeave: SickLeaveDto) => {
            const res = await api.post(`/employee-options/add-sick-leave/${employeeId}`, sickLeave, {
                headers: { "X-Organization-Id": getOrgId() },
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Sick leave added successfully");
            queryClient.invalidateQueries({ queryKey: ["sickLeaves", employeeId] });
        },
        onError: () => {
            toast.error("Failed to add sick leave");
        },
    });
}

export function useDeleteSickLeave(employeeId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sickLeaveId: number) => {
            await api.delete(`/employee-options/sick-leave/${employeeId}/${sickLeaveId}`, {
                headers: { "X-Organization-Id": getOrgId() },
            });
        },
        onSuccess: () => {
            toast.success("Sick leave deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["sickLeaves", employeeId] });
        },
        onError: () => {
            toast.error("Failed to delete sick leave");
        },
    });
}
