import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import {Group, GroupFormValues} from "@/types";

export function useGetGroups() {
    return useQuery({
        queryKey: ["groups"],
        queryFn: async () => {
            const res = await api.get<Group[]>("/groups");
            return res.data;
        },
    });
}

export function useCreateGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: GroupFormValues) => api.post("/groups", payload),
        onSuccess: () => {
            toast.success("Group created!");
            queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
        onError: () => toast.error("Error creating group"),
    });
}

export function useUpdateGroup(groupId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: GroupFormValues) => api.put(`/groups/${groupId}`, payload),
        onSuccess: () => {
            toast.success("Group updated!");
            queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
        onError: () => toast.error("Error updating group"),
    });
}

export function useDeleteGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (groupId: number) => api.delete(`/groups/${groupId}`),
        onSuccess: () => {
            toast.success("Group deleted!");
            queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
        onError: () => toast.error("Error deleting group"),
    });
}
