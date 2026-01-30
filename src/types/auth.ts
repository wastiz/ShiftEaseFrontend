import {User} from "@/types/user";

//Register
export type RegisterPayload = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
};

export interface RegisterResponse {
    success: boolean;
    message: string;
    user: User;
}

//Login
export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    user: User;
}

//Google Auth
export interface GoogleAuthPayload {
    code: string;
    redirectUri: string;
}

//Logout
export interface LogoutResponse {
    success: boolean;
    message: string;
}

//User Info (like /me request)
export interface GetProfileResponse {
    success: boolean;
    user: User;
}


//Forgot Password
export type ForgotPasswordPayload = {
    email: string;
};

//Delete User
export type DeleteUserPayload = {
    password: string;
};



// --- Error (универсально) ---
export interface ErrorResponse {
    success: false;
    message: string;
    errors?: string[];
}

// API Error type for axios errors
export interface ApiErrorData {
    message?: string;
    title?: string;
    errors?: string[];
}

export interface ApiError {
    response?: {
        data?: ApiErrorData;
    };
}

export function getErrorMessage(err: ApiError): string {
    const errorData = err?.response?.data;
    return (
        errorData?.message ||
        errorData?.title ||
        (errorData?.errors && Array.isArray(errorData.errors)
            ? errorData.errors.join(', ')
            : null) ||
        'Something went wrong'
    );
}
