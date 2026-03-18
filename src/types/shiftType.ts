export type ShiftTemplateFormValues = {
    name: string;
    startTime: string;
    endTime: string;
    minEmployees: number;
    maxEmployees: number;
    color: string;
    departmentId: number;
}

export type PendingShiftTemplate = Omit<ShiftTemplateFormValues, 'departmentId'>

export type ShiftTemplate = {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    minEmployees: number;
    maxEmployees: number;
    color: string;
    departmentId: number;
};

