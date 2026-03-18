import { DayOfWeek } from './index';

export type DepartmentFormValues = {
    name: string;
    description?: string;
    color?: string;
    startTime?: string;
    endTime?: string;
    workingDays?: DayOfWeek[];
    defaultSchedulePattern?: SchedulePattern;
};

export type Department = {
    id: number
    name: string
    description?: string
    color: string
    startTime?: string;
    endTime?: string;
    workingDays: DayOfWeek[];
    defaultSchedulePattern: SchedulePattern;
    autorenewSchedules: boolean
}

export enum SchedulePattern {
    Flexible = 0,
    TwoOnTwoOff = 1,
    FiveOnTwoOff = 2,
    ThreeOnThreeOff = 3,
    FourOnFourOff = 4
}
