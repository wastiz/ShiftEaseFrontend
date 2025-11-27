import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
    RegisterPayload,
    RegisterResponse,
    LoginPayload,
    LoginResponse,
    ForgotPasswordPayload,
    DeleteUserPayload,
    Role, EmployerMeData, User,
} from "@/types";
import {authKeys} from "@/lib/api-keys";


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

export function useEmployerLogout(role: Role) {
    return useMutation<void, Error>({
        mutationFn: async () => {
            await api.post(`/auth/${role}/logout`);
        },
    });
}

export function useForgotPassword(role: Role) {
    return useMutation({
        mutationFn: async (payload) => {
            const res = await api.post(`/auth/${role}/forgot-password`, payload);
            return res.data;
        },
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: async (queryParam: string) => {
            const res = await api.post(
                `/change-forgotten-password/${queryParam}`
            );
            return res.data;
        },
    });
}

export function useDeleteUser() {
    return useMutation({
        mutationFn: async (payload) => {
            const res = await api.post("/me/delete", payload);
            return res.data;
        },
    });
}

export function useGetMe({ isEnabled }: { isEnabled: boolean }) {
    return useQuery({
        queryKey: authKeys.currentUser(),
        queryFn: async () => {
            const response = await api.get<User>('/auth/me');
            return response.data;
        },
        enabled: isEnabled,
        retry: false,
        staleTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false
    });
}

//
// export function useRefreshToken() {
//     return useQuery({
//         queryKey: ["refreshToken"],
//         queryFn: async () => {
//             const res = await api.post<RefreshTokenResponse>("/refresh");
//             return res.data;
//         },
//     });
// }
//
// export function useVerifyEmail(payload: VerifyEmailPayload) {
//     return useQuery<VerifyEmailResponse, Error>({
//         queryKey: ["verifyEmail", payload.code],
//         queryFn: async () => {
//             const res = await api.get<VerifyEmailResponse>(`/user/${payload.code}`);
//             return res.data;
//         },
//     });
// }
