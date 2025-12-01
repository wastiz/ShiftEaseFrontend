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

export function useLogout() {
    const router = useRouter();

    return useMutation<void, Error>({
        mutationFn: async () => {
            await api.post(`/auth/logout`);
        },
        onSuccess: () => {
            router.push('/login');
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
            console.log(response);
            return response.data;
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

// export function useDeleteUser() {
//     return useMutation({
//         mutationFn: async (payload) => {
//             const res = await api.post("/me/delete", payload);
//             return res.data;
//         },
//     });
// }
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
