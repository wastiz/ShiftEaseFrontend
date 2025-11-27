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

export interface BulkCreateResult {
    successCount: number;
    failedCount: number;
    successfulEmployees: EmployeeCreateSuccess[];
    failedEmployees: EmployeeCreateError[];
}

export interface EmployeeCreateSuccess {
    firstName: string;
    lastName: string;
    email: string;
}

export interface EmployeeCreateError {
    firstName: string;
    lastName: string;
    email: string;
    errorMessage: string;
}

export type EmployeeMinData = {
    id: number;
    name: string;
    groupName: string;
}
