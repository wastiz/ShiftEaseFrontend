import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import api from "@/lib/api";
import { NotificationDto } from "@/types/notification";

export function useNotifications() {
    return useQuery<NotificationDto[], Error>({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await api.get<NotificationDto[]>(
                "notifications"
            );
            return res.data;
        },
    });
}

export function useUnreadNotificationsCount() {
    return useQuery<number, Error>({
        queryKey: ["notifications", "unread-count"],
        queryFn: async () => {
            const res = await api.get<number>(
                "notifications/unread-count"
            );
            return res.data;
        },
    });
}


export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id) => {
            await api.post(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["notifications"],
            });
            queryClient.invalidateQueries({
                queryKey: ["notifications", "unread-count"],
            });
        },
    });
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation<void, Error>({
        mutationFn: async () => {
            await api.post("notifications/read-all");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["notifications"],
            });
            queryClient.invalidateQueries({
                queryKey: ["notifications", "unread-count"],
            });
        },
    });
}

