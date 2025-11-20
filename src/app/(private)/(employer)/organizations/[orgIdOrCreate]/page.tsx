"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import HolidaySelector from "@/components/inputs/HolidaySelector";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/shadcn/form";
import { Textarea } from "@/components/ui/shadcn/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/shadcn/select";
import { Switch } from "@/components/ui/shadcn/switch";
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/shadcn/toggle-group";
import { useAddOrganization, useGetOrganization, useUpdateOrganization } from "@/api";
import Header from "@/modules/Header";
import Main from "@/modules/Main";
import { dayNameToEnum, Holiday, OrganizationFormValues, WorkDay } from "@/types";
import { TimePicker } from "@/components/inputs/TimePicker";

const formSchema = z.object({
    name: z.string().min(1, "Organization name is required"),
    description: z.string().min(1, "Description is required"),
    organizationType: z.string().min(1, "Type is required"),
    website: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    photoUrl: z.string().optional(),
    nightShiftBonus: z.coerce.number().optional(),
    holidayBonus: z.coerce.number().optional(),
    employeeCount: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type LocalWorkDay = { active: boolean; startTime: string; endTime: string };
type ScheduleMode = "manual" | "fiveTwo" | "fullTime";

const INITIAL_WORK_DAYS: Record<string, LocalWorkDay> = {
    monday: { active: false, startTime: "08:00", endTime: "17:00" },
    tuesday: { active: false, startTime: "08:00", endTime: "17:00" },
    wednesday: { active: false, startTime: "08:00", endTime: "17:00" },
    thursday: { active: false, startTime: "08:00", endTime: "17:00" },
    friday: { active: false, startTime: "08:00", endTime: "17:00" },
    saturday: { active: false, startTime: "08:00", endTime: "17:00" },
    sunday: { active: false, startTime: "08:00", endTime: "17:00" },
};

const ORG_TYPES = ["Retail", "Hospitality", "Healthcare", "Manufacturing", "Other"];

export default function AddOrganization() {
    const router = useRouter();
    const params = useParams();
    const orgId = params?.orgIdOrCreate === "create" ? undefined : String(params?.orgIdOrCreate);

    const isEditMode = !!orgId && orgId !== "create";

    const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("manual");
    const [selectedHolidays, setSelectedHolidays] = useState<Holiday[]>([]);
    const [workDays, setWorkDays] = useState<Record<string, LocalWorkDay>>(INITIAL_WORK_DAYS);
    const [isFormInitialized, setIsFormInitialized] = useState(false);

    const addOrganization = useAddOrganization();
    const updateOrganization = useUpdateOrganization();
    const { data: org, isLoading } = useGetOrganization(isEditMode ? orgId : "", {
        enabled: isEditMode,
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            organizationType: "",
            website: "",
            phone: "",
            address: "",
            photoUrl: "",
            nightShiftBonus: 0,
            holidayBonus: 0,
            employeeCount: 0,
        },
    });

    useEffect(() => {
        if (isEditMode && org && !isFormInitialized) {
            form.reset({
                name: org.name || "",
                description: org.description || "",
                organizationType: org.organizationType || "",
                website: org.website || "",
                phone: org.phone || "",
                address: org.address || "",
                photoUrl: org.photoUrl || "",
                nightShiftBonus: org.nightShiftBonus || 0,
                holidayBonus: org.holidayBonus || 0,
                employeeCount: org.employeeCount || 0,
            });

            if (org.workDays && org.workDays.length > 0) {
                const reconstructed = { ...INITIAL_WORK_DAYS };

                org.workDays.forEach((d: WorkDay) => {
                    const dayName = d.dayOfWeek.toLowerCase();
                    if (reconstructed[dayName]) {
                        const startTime = d.startTime?.includes(':') ? d.startTime.slice(0, 5) : '08:00';
                        const endTime = d.endTime?.includes(':') ? d.endTime.slice(0, 5) : '17:00';

                        reconstructed[dayName] = {
                            active: true,
                            startTime,
                            endTime,
                        };
                    }
                });

                setWorkDays(reconstructed);

                const allActive = Object.values(reconstructed).every(d => d.active);
                const allFullDay = Object.values(reconstructed).every(d =>
                    d.startTime === "00:00" && d.endTime === "23:59"
                );

                if (allActive && allFullDay) {
                    setScheduleMode("fullTime");
                } else if (
                    reconstructed.monday.active &&
                    reconstructed.tuesday.active &&
                    reconstructed.wednesday.active &&
                    reconstructed.thursday.active &&
                    reconstructed.friday.active &&
                    !reconstructed.saturday.active &&
                    !reconstructed.sunday.active
                ) {
                    setScheduleMode("fiveTwo");
                } else {
                    setScheduleMode("manual");
                }
            }

            if (org.holidays && org.holidays.length > 0) {
                const normalizedHolidays: Holiday[] = org.holidays.map((h: any) => ({
                    holidayName: h.holidayName || h.name,
                    month: h.month,
                    day: h.day,
                }));
                setSelectedHolidays(normalizedHolidays);
            }

            setIsFormInitialized(true);
        } else if (!isEditMode && !isFormInitialized) {
            setIsFormInitialized(true);
        }
    }, [org, isEditMode, isFormInitialized, form]);

    const transformWorkDays = (input: typeof workDays): WorkDay[] => {
        return Object.entries(input)
            .filter(([_, d]) => d.active)
            .map(([dayName, d]) => ({
                dayOfWeek: dayNameToEnum[dayName],
                startTime: d.startTime,
                endTime: d.endTime,
            }));
    };

    const handleScheduleModeChange = (val: string) => {
        const mode = val as ScheduleMode;
        setScheduleMode(mode);

        if (mode === "fiveTwo") {
            setWorkDays({
                monday: { active: true, startTime: "08:00", endTime: "17:00" },
                tuesday: { active: true, startTime: "08:00", endTime: "17:00" },
                wednesday: { active: true, startTime: "08:00", endTime: "17:00" },
                thursday: { active: true, startTime: "08:00", endTime: "17:00" },
                friday: { active: true, startTime: "08:00", endTime: "17:00" },
                saturday: { active: false, startTime: "08:00", endTime: "17:00" },
                sunday: { active: false, startTime: "08:00", endTime: "17:00" },
            });
        } else if (mode === "fullTime") {
            setWorkDays({
                monday: { active: true, startTime: "00:00", endTime: "00:00" },
                tuesday: { active: true, startTime: "00:00", endTime: "00:00" },
                wednesday: { active: true, startTime: "00:00", endTime: "00:00" },
                thursday: { active: true, startTime: "00:00", endTime: "00:00" },
                friday: { active: true, startTime: "00:00", endTime: "00:00" },
                saturday: { active: true, startTime: "00:00", endTime: "00:00" },
                sunday: { active: true, startTime: "00:00", endTime: "00:00" },
            });
        } else {
            setWorkDays(INITIAL_WORK_DAYS);
        }
    };

    const handleDayToggle = (day: string) => {
        setWorkDays(prev => ({
            ...prev,
            [day]: { ...prev[day], active: !prev[day].active },
        }));
    };

    const handleTimeChange = (day: string, field: "startTime" | "endTime", val: string) => {
        setWorkDays(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: val },
        }));
    };

    const onSubmit = async (values: FormValues) => {
        const organizationData: OrganizationFormValues = {
            ...(isEditMode && { id: Number(orgId) }),
            name: values.name,
            description: values.description,
            organizationType: values.organizationType,
            website: values.website,
            phone: values.phone,
            address: values.address,
            photoUrl: values.photoUrl,
            isOpen24_7: false,
            nightShiftBonus: Number(values.nightShiftBonus) || 0,
            holidayBonus: Number(values.holidayBonus) || 0,
            employeeCount: Number(values.employeeCount) || 0,
            workDays: transformWorkDays(workDays),
            holidays: selectedHolidays,
        };

        const mutation = isEditMode ? updateOrganization : addOrganization;

        console.log(organizationData);

        mutation.mutate(organizationData, {
            onSuccess: () => {
                toast.success(isEditMode ? "Organization updated" : "Organization created");
                router.push("/organizations");
            },
            onError: (error: any) => {
                console.error("Error:", error);
                toast.error(`Failed to ${isEditMode ? "update" : "create"} organization`);
            },
        });
    };

    const isPending = addOrganization.isPending || updateOrganization.isPending;

    if (isEditMode && (isLoading || !isFormInitialized)) {
        return (
            <>
                <Header title="Organization" />
                <Main>
                    <div className="flex items-center justify-center h-96">
                        <p>Loading organization data...</p>
                    </div>
                </Main>
            </>
        );
    }

    return (
        <>
            <Header title="Organization" />
            <Main>
                <Card className="max-w-5xl mx-auto">
                    <CardHeader>
                        <CardTitle>{isEditMode ? "Edit Organization" : "Create Organization"}</CardTitle>
                    </CardHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Organization Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Enter organization name"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            rows={3}
                                                            {...field}
                                                            placeholder="Enter organization description"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="organizationType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Organization Type</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select organization type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {ORG_TYPES.map(t => (
                                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <FormField
                                            name="website"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Website</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="url"
                                                            {...field}
                                                            placeholder="https://example.com"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            name="phone"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="tel"
                                                            {...field}
                                                            placeholder="+1 (555) 123-4567"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            name="address"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Address</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Enter organization address"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            name="photoUrl"
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Photo URL</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="https://example.com/photo.jpg"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        name="nightShiftBonus"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Night Shift Bonus (%)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        min="0"
                                                        max="100"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="holidayBonus"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Holiday Bonus (%)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        min="0"
                                                        max="100"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="employeeCount"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Employee Count</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        min="0"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-sm font-medium">Work Schedule</Label>
                                    <ToggleGroup
                                        type="single"
                                        value={scheduleMode}
                                        onValueChange={handleScheduleModeChange}
                                        className="flex gap-2"
                                    >
                                        <ToggleGroupItem value="manual">Manual</ToggleGroupItem>
                                        <ToggleGroupItem value="fiveTwo">5/2 Work Week</ToggleGroupItem>
                                        <ToggleGroupItem value="fullTime">24/7 Operation</ToggleGroupItem>
                                    </ToggleGroup>

                                    <div className="flex flex-col gap-4">
                                        {Object.entries(workDays).map(([day, conf]) => (
                                            <div key={day} className="flex items-center gap-2">
                                                <Switch
                                                    checked={conf.active}
                                                    onCheckedChange={() => handleDayToggle(day)}
                                                />
                                                <span className="capitalize w-24">{day}</span>
                                                {conf.active && (
                                                    <>
                                                        <TimePicker
                                                            value={conf.startTime}
                                                            onChange={(time) => handleTimeChange(day, "startTime", time)}
                                                        />
                                                        <span>to</span>
                                                        <TimePicker
                                                            value={conf.endTime}
                                                            onChange={(time) => handleTimeChange(day, "endTime", time)}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <HolidaySelector
                                    selectedHolidays={selectedHolidays}
                                    setSelectedHolidays={setSelectedHolidays}
                                />
                            </CardContent>

                            <CardFooter className="flex justify-end gap-3 mt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                >
                                    {isPending
                                        ? "Saving..."
                                        : isEditMode
                                            ? "Save Changes"
                                            : "Create Organization"
                                    }
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </Main>
        </>
    );
}
