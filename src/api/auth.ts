import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
    RegisterPayload,
    RegisterResponse,
    LoginPayload,
    LoginResponse,
    ForgotPasswordPayload,
    GoogleAuthPayload,
    Role,
    User,
} from "@/types";
import {authKeys} from "@/lib/api-keys";
import {useRouter} from "next/navigation";


export function useEmployerRegister() {
    return useMutation<RegisterResponse, Error, RegisterPayload>({
        mutationFn: async (payload) => {
            const res = await api.post<RegisterResponse>("/auth/employer/register", payload);
            return res.data;
        },
    });
}

export function useLogin(role: Role) {
    return useMutation<LoginResponse, Error, LoginPayload>({
        mutationFn: async (payload) => {
            const res = await api.post<LoginResponse>(`/auth/${role}/login`, payload);
            return res.data;
        },
    });
}

export function useEmployerGoogleLogin() {
    return useMutation<LoginResponse, Error, GoogleAuthPayload>({
        mutationFn: async (payload) => {
            const res = await api.post<LoginResponse>("/auth/employer/google", payload);
            return res.data;
        },
    });
}

export function useLogout() {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation<void, Error>({
        mutationFn: async () => {
            localStorage.removeItem("orgId");
            localStorage.removeItem("auth-storage");
            await api.post(`/auth/logout`);
        },
        onSuccess: () => {
            queryClient.clear();
            router.push('/sign-in');
        }
    });
}

export function useForgotPassword() {
    return useMutation({
        mutationFn: async (payload: ForgotPasswordPayload) => {
            const res = await api.post(`/auth/forgot-password`, payload);
            return res.data;
        },
    });
}

export function useResetPassword() {
    return useMutation({
        mutationFn: async (payload: { token: string; newPassword: string }) => {
            const response = await api.post("/auth/reset-password", payload);
            return response.data;
        },
    });
}

const AUTH_STALE_TIME = 15 * 60 * 1000; // 15 minutes

export function useGetMe({ isEnabled }: { isEnabled: boolean }) {
    return useQuery({
        queryKey: authKeys.currentUser(),
        queryFn: async () => {
            const response = await api.get<User>('/auth/me');
            return response.data;
        },
        enabled: isEnabled,
        retry: false,
        staleTime: AUTH_STALE_TIME,
        refetchOnWindowFocus: false
    });
}
