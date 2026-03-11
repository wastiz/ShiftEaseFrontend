import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import {Department, DepartmentFormValues} from "@/types";
import {departmentKeys} from "@/lib/api-keys";

export function useGetDepartments() {
    return useQuery({
        queryKey: departmentKeys.all,
        queryFn: async () => {
            const res = await api.get<Department[]>("/departments");
            return res.data;
        },
    });
}

export function useCreateDepartment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: DepartmentFormValues) => api.post("/departments", payload),
        onSuccess: () => {
            toast.success("Department created!");
            queryClient.invalidateQueries({ queryKey: departmentKeys.all });
        },
        onError: () => toast.error("Error creating department"),
    });
}

export function useUpdateDepartment(departmentId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: DepartmentFormValues) => api.put(`/departments/${departmentId}`, payload),
        onSuccess: () => {
            toast.success("Department updated!");
            queryClient.invalidateQueries({ queryKey: departmentKeys.all });
        },
        onError: () => toast.error("Error updating department"),
    });
}

export function useDeleteDepartment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (departmentId: number) => api.delete(`/departments/${departmentId}`),
        onSuccess: () => {
            toast.success("Department deleted!");
            queryClient.invalidateQueries({ queryKey: departmentKeys.all });
        },
        onError: () => toast.error("Error deleting department"),
    });
}
