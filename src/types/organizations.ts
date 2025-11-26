import {ScheduleSummary} from "@/types/schedule";

export type Organization = {
    id: number
    name: string
    description?: string
    address?: string
    phone?: string
    website?: string
    organizationType: string
    isOpen24_7: boolean
    nightShiftBonus: number
    holidayBonus: number
    photoUrl?: string
    employeeCount: number
    createdAt: string
    employerId: number
    holidays: Holiday[]
    workDays: WorkDay[]
}

export type Holiday = {
    holidayName: string
    month: number
    day: number
}

export interface WorkDay {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
}

export interface OrganizationFormValues {
    id?: number;
    name: string;
    description: string;
    organizationType: string;
    website?: string;
    phone?: string;
    address?: string;
    photoUrl?: string;
    nightShiftBonus?: number;
    holidayBonus?: number;
    employeeCount?: number;
    isOpen24_7: boolean;
    holidays: Holiday[];
    workDays: WorkDay[] | null;
}

export interface OrganizationDashboardData {
    id: number;
    name: string;
    groupCount: number;
    shiftTypeCount: number;
    employeeCount: number;
    scheduleCount: number;
    scheduleSummaries: ScheduleSummary[];
}
