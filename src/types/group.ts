export type GroupFormValues = {
    name: string;
    description?: string;
    color?: string;
    startTime?: string;
    endTime?: string;
};

export type Group = {
    id: number
    name: string
    description?: string
    color: string
    startTime?: string;
    endTime?: string;
    autorenewSchedules: boolean
}
