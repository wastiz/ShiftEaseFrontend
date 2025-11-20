import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Employee } from "@/types";

export function useGetEmployees() {
    return useQuery({
        queryKey: ["employees"],
        queryFn: async () => {
            const res = await api.get<Employee[]>("/employees", {
                headers: {
                    "X-Organization-Id": localStorage.getItem("orgId") ?? "",
                },
            });
            return res.data;
        },
    });
}

export function useGetEmployee(id: number) {
    return useQuery({
        queryKey: ["employees", id],
        queryFn: async () => {
            const res = await api.get<Employee>(`/employees/${id}`);
            return res.data;
        },
        enabled: !!id, // запрос не выполняется если id = 0/undefined
    });
}

export function useCreateEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (employee: Partial<Employee>) => {
            const res = await api.post("/employees", employee, {
                headers: {
                    "X-Organization-Id": localStorage.getItem("orgId") ?? "",
                },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
    });
}

export function useUpdateEmployee(id: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (employee: Partial<Employee>) => {
            const res = await api.put(`/employees/${id}`, employee);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
    });
}

export function useDeleteEmployee(id: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const res = await api.delete(`/employees/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
    });
}
