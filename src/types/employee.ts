export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    hourlyRate: number;
    priority: string;
    groupIds: number[];
    groupNames?: string[] | null;
    onVacation?: boolean;
    onSickLeave?: boolean;
    onWork?: boolean;
}

export interface BulkCreateData {
    successCount: number;
    failedCount: number;
    successfulEmployees: EmployeeCreateSuccess[];
    failedEmployees: EmployeeCreateError[];
}

export interface BulkCreateResult {
    success: boolean;
    message: string;
    data: BulkCreateData;
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
    position?: string;
}
