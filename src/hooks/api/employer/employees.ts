import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { BulkCreateResult, Employee, EmployeeTimeOff, GetEmployeesTimeOffsParams } from "@/types";
import { employeeKeys } from "@/lib/api-keys";

export function useGetEmployees() {
    return useQuery({
        queryKey: employeeKeys.all,
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
        queryKey: employeeKeys.detail(id),
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
            queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        },
    });
}

export function useBulkCreateEmployees() {
    return useMutation({
        mutationFn: async (employees: Partial<Employee>[]) => {
            const res = await api.post<BulkCreateResult>('/employees/bulk', employees);
            return res.data;
        }
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
            queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        },
    });
}

export function useGetEmployeesTimeOffs(params: GetEmployeesTimeOffsParams = {}, enabled = true) {
    const { year, month, employeeIds } = params;
    return useQuery<EmployeeTimeOff[]>({
        queryKey: employeeKeys.timeOffs(year, month, employeeIds),
        queryFn: async () => {
            const res = await api.get<EmployeeTimeOff[]>("/employees/time-offs", {
                params: {
                    ...(year !== undefined && { year }),
                    ...(month !== undefined && { month }),
                    ...(employeeIds?.length && { employeeIds }),
                },
            });
            return res.data;
        },
        enabled,
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
            queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        },
    });
}
