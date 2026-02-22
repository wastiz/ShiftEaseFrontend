import {Holiday, WorkDay} from "@/types/organizations";
import {EmployeeMinData} from "@/types/employee";
import {Group} from "@/types/group";
import {ShiftType} from "@/types/shiftType";

export interface ScheduleSummary {
    groupId: number;
    groupName: string;
    confirmedSchedules: ScheduleItem[];
    unconfirmedSchedules: ScheduleItem[];
}

export interface ScheduleItem {
    id: number;
    month: string;
}

export type ScheduleEditorData = {
    employees: EmployeeMinData[];
    shiftTypes: ShiftType[];
    groups: Group[];
    organizationHolidays: Holiday[];
    organizationSchedule: WorkDay[];
    employeeTimeOffs: EmployeeTimeOff[]
    schedule: Schedule
};

export type Schedule = {
    id: number;
    startDate: Date;
    endDate: Date;
    isConfirmed: boolean;
    shifts: Shift[];
}

export type EmployeeTimeOff = {
    id: number;
    employeeId: number;
    employeeName: string;
    startDate: Date;
    endDate: Date;
    type: TimeOffType;
}

export enum TimeOffType {
    Vacation,
    SickLeave,
    PersonalDay
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
    employees: EmployeeShiftAssignment[];
}

export type EmployeeShiftAssignment = {
    id: number;
    name: string;
    groupName?: string;
    note?: string;
}

export interface ScheduleRequest {
    month: number
    year: number
}

export type SchedulePost = {
    startDate: string
    endDate: string
    isConfirmed: boolean
    shifts: ShiftPost[];
}

export type ShiftPost = {
    shiftTypeId: number;
    date: string;
    employees: EmployeeIdWithNote[];
}

export type EmployeeIdWithNote = {
    id: number;
    note: string;
}

export enum SchedulePattern {
    Custom = 0,
    TwoOnTwoOff = 1,
    FiveOnTwoOff = 2,
    ThreeOnThreeOff = 3,
    FourOnFourOff = 4
}

export type ScheduleGenerateRequest = {
    id: number
    startDate: string
    endDate: string
    AllowedShiftTypeIds: number[];
    MaxConsecutiveShifts: number;
    SchedulePattern: SchedulePattern;
    MinDaysOffPerWeek: number;
}

export type RetailScheduleGenerateRequest = {
    scheduleId: number;
    totalHours: number;
    maxConsecutiveShifts: number;
    minDaysOffPerWeek: number;
}

export type ScheduleGenerateResult =
    | {
    status: GenerateStatus.Success;
    shifts: Shift[];
    warnings: [];
    error?: never;
}
    | {
    status: GenerateStatus.Warning;
    shifts: Shift[];
    warnings: GenerateWarningCode[];
    error?: never;
}
    | {
    status: GenerateStatus.Error;
    error: GenerateErrorCode;
    warnings: [];
    shifts?: never;
};


export enum GenerateStatus {
    Success = "Success",
    Warning = "Warning",
    Error = "Error",
}

export enum GenerateErrorCode {
    GroupNotFound = "GroupNotFound",
    OrganizationNotFound = "OrganizationNotFound",
    NoEmployeesInGroup = "NoEmployeesInGroup",
    NoShiftTypes = "NoShiftTypes",
    SelectedShiftTypesNotFound = "SelectedShiftTypesNotFound",
    NoWorkDaysConfigured = "NoWorkDaysConfigured",
    InvalidDateRange = "InvalidDateRange",
    AllDaysAreHolidays = "AllDaysAreHolidays",
    AllDaysAreNonWorking = "AllDaysAreNonWorking",
    ShiftTypesDontFitSchedule = "ShiftTypesDontFitSchedule",
}

export enum GenerateWarningCode {
    NoSuitableShiftTypes = "NoSuitableShiftTypes",
    NotEnoughEmployeesForMinimum = "NotEnoughEmployeesForMinimum",
    EmployeesAssignedWithConstraintViolations = "EmployeesAssignedWithConstraintViolations",
    AllEmployeesOnTimeOff = "AllEmployeesOnTimeOff",
    HighWorkloadDetected = "HighWorkloadDetected",
    SomeDaysWithoutShifts = "SomeDaysWithoutShifts",
}

