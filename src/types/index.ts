//Imports from other type files, so importing types on components would be pleasant

export * from "./auth";
export * from "./organizations";
export * from "./schedule";
export * from "./employee";
export * from "./employee-options";
export * from "./group";
export * from "./shiftType";
export * from "./notification";


export type Role = "Employer" | "Employee";
export type Mode = "login" | "register" | "forgot"

export const dayNameToEnum: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
};

export const enumToDayName: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
};

export interface User {
    authenticated: boolean;
    id: number;
    role: Role;
    fullName: string;
    email: string;
}

export type EmployerMeData = User;

export interface EmployeeMeData extends User {
    groupIds: number[];
    groupNames: string[];
    organizationId: number;
    organizationName: string;
    position: string;
}

export type DateData = {
    isoDate: string;
    label: string;
};

export type CheckEntitiesResult = {
    groups: boolean;
    employees: boolean;
    shiftTypes: boolean;
    schedules: boolean;
}
