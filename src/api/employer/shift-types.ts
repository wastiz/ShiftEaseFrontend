import {useMutation, useQuery} from "@tanstack/react-query";
import api from "@/lib/api";
import {toast} from "sonner";
import {ShiftType, ShiftTypeFormValues} from "@/types";


export function useGetShiftTypes() {
    return useQuery({
        queryKey: ["shift-types"],
        queryFn: async () => {
            const res = await api.get<ShiftType[]>(`/shift-types`);
            return res.data;
        },
    });
}

export const useCreateShiftType = () => {
    return useMutation({
        mutationFn: (payload: ShiftTypeFormValues) => api.post("/shift-types", payload),
        onSuccess: () => {
            toast.success("Shift type created!");
        },
        onError: () => toast.error("Error creating shift type"),
    });
}

export const useUpdateShiftType = (shiftTypeId: number) => {
    return useMutation({
        mutationFn: (payload: ShiftTypeFormValues) =>
            api.put(`/shift-types/${shiftTypeId}`, payload),
        onSuccess: () => {
            toast.success("Shift type updated!");
        },
        onError: () => toast.error("Error updating shift type"),
    });
}

export const useDeleteShiftType = () => {
    return useMutation({
        mutationFn: (shiftTypeId: number) => api.delete(`/shift-types/${shiftTypeId}`),
        onSuccess: () => {
            toast.success("Shift type deleted!");
        },
        onError: () => toast.error("Error deleting shift type"),
    });
}
