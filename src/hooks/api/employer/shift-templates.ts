import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import api from "@/lib/api";
import {toast} from "sonner";
import {ShiftTemplate, ShiftTemplateFormValues} from "@/types";
import {shiftTemplateKeys} from "@/lib/api-keys";


export function useGetShiftTemplates() {
    return useQuery({
        queryKey: shiftTemplateKeys.all,
        queryFn: async () => {
            const res = await api.get<ShiftTemplate[]>(`/shift-templates`);
            return res.data;
        },
    });
}

export const useCreateShiftTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ShiftTemplateFormValues) => api.post("/shift-templates", payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shiftTemplateKeys.all });
            toast.success("Shift template created!");
        },
        onError: () => toast.error("Error creating shift template"),
    });
}

export const useUpdateShiftTemplate = (shiftTemplateId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ShiftTemplateFormValues) =>
            api.put(`/shift-templates/${shiftTemplateId}`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shiftTemplateKeys.all });
            toast.success("Shift template updated!");
        },
        onError: () => toast.error("Error updating shift template"),
    });
}

export const useDeleteShiftTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (shiftTemplateId: number) => api.delete(`/shift-templates/${shiftTemplateId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shiftTemplateKeys.all });
            toast.success("Shift template deleted!");
        },
        onError: () => toast.error("Error deleting shift template"),
    });
}
