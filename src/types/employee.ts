export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    workload: number;
    salary: number;
    priority: string;
    groupId: number;
    groupName?: string | null;
    onVacation?: boolean;
    onSickLeave?: boolean;
    onWork?: boolean;
}

export type EmployeeMinData = {
    id: number;
    name: string;
    groupName: string;
}
