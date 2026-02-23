import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import api from "@/lib/api";
import {toast} from "sonner";
import {ShiftType, ShiftTypeFormValues} from "@/types";
import {shiftTypeKeys} from "@/lib/api-keys";


export function useGetShiftTypes() {
    return useQuery({
        queryKey: shiftTypeKeys.all,
        queryFn: async () => {
            const res = await api.get<ShiftType[]>(`/shift-types`);
            return res.data;
        },
    });
}

export const useCreateShiftType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ShiftTypeFormValues) => api.post("/shift-types", payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shiftTypeKeys.all });
            toast.success("Shift type created!");
        },
        onError: () => toast.error("Error creating shift type"),
    });
}

export const useUpdateShiftType = (shiftTypeId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ShiftTypeFormValues) =>
            api.put(`/shift-types/${shiftTypeId}`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shiftTypeKeys.all });
            toast.success("Shift type updated!");
        },
        onError: () => toast.error("Error updating shift type"),
    });
}

export const useDeleteShiftType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (shiftTypeId: number) => api.delete(`/shift-types/${shiftTypeId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shiftTypeKeys.all });
            toast.success("Shift type deleted!");
        },
        onError: () => toast.error("Error deleting shift type"),
    });
}
