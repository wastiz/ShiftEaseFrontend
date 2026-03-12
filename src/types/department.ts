import { DayOfWeek } from './index';

export type DepartmentFormValues = {
    name: string;
    description?: string;
    color?: string;
    startTime?: string;
    endTime?: string;
    workingDays?: DayOfWeek[];
    defaultSchedulePattern?: string;
};

export type Department = {
    id: number
    name: string
    description?: string
    color: string
    startTime?: string;
    endTime?: string;
    workingDays: DayOfWeek[];
    defaultSchedulePattern: string;
    autorenewSchedules: boolean
}
