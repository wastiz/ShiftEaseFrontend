export interface VacationRequestDto {
    id?: number;
    startDate: string;
    endDate: string;
    reason?: string;
    status?: 'pending' | 'approved' | 'rejected';
}

export interface SickLeaveDto {
    id?: number;
    startDate: string;
    endDate: string;
    diagnosis?: string;
    documentNumber?: string;
}

export interface WeekDayPreferenceDto {
    id?: number;
    dayOfWeek: number; // 0-6
    isPreferred: boolean;
    reason?: string;
}

export interface ShiftTypePreferenceDto {
    shiftTypeId: number;
    shiftTypeName: string;
    priority: number; // 1-5
}

export interface PreferenceBundle {
    shiftTypePreferences: number[];
    weekDayPreferences: DayOfWeek[];
    dayOffPreferences: string[];
}

export enum DayOfWeek {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}
