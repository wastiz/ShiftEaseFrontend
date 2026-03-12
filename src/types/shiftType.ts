export type ShiftTypeFormValues = {
    name: string;
    startTime: string;
    endTime: string;
    minEmployees: number;
    maxEmployees: number;
    color: string;
    departmentId: number;
}

export type ShiftType = {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    minEmployees: number;
    maxEmployees: number;
    color: string;
    departmentId: number;
};

