//Imports from other type files, so importing types on components would be pleasant

export * from "./auth";
export * from "./organizations";
export * from "./schedule";
export * from "./employee";
export * from "./employee-options";
export * from "./group";
export * from "./shiftType";


export type Role = "employer" | "employee";
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

export type User = {
    authenticated: boolean;
    id: number;
    role: Role;
    fullName: string;
};


export type Employer = {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
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
