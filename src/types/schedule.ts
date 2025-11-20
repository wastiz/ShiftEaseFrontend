import {Holiday, ShiftType, WorkDay} from "@/types/organizations";
import {EmployeeMinData} from "@/types/employee";
import {Group} from "@/types/group";


export type Schedule ={
    scheduleInfo: ScheduleInfo;
    organizationHolidays: Holiday[];
    organizationSchedule: WorkDay[];
    shifts: Shift[];
}

export type ScheduleEditorData = {
    employees: EmployeeMinData[];
    shiftTypes: ShiftType[];
    groups: Group[];
};

export type ScheduleInfo = {
    id: number
    startDate: Date
    endDate: Date
    groupId: number
    isConfirmed: boolean
}

export type Shift = {
    id: number;
    date: string;
    shiftTypeId: number;
    shiftTypeName: string;
    startTime: string;
    endTime: string;
    color: string;
    employeeNeeded: number;
    employees: EmployeeMinData[];
}

export interface ScheduleRequest {
    groupId: number
    month: number
    year: number
    showOnlyConfirmed: boolean
}

export type SchedulePost = {
    groupId: number
    startDate: string
    endDate: string
    autorenewal: boolean
    isConfirmed: boolean
    shifts: ShiftPost[];
}

export type ShiftPost = {
    shiftTypeId: number;
    date: string;
    employeeIds: number[];
}

export type ScheduleGenerateRequest = {
    id: number
    startDate: string
    endDate: string
    groupId: number
}

export type ScheduleSummary = {
    groupId: number
    groupName: string
    confirmedMonths: string[]
    unconfirmedMonths: string[]
    autorenewal: boolean
}

