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
