'use client'

import {Button} from "@/components/ui/shadcn/button";
import {useRouter} from "next/navigation";
import {Check} from "lucide-react";
import {X} from "lucide-react";
import {CheckEntitiesResult} from "@/types";

export default function EntityCheckResult(entities: CheckEntitiesResult) {
    const router = useRouter();

    const items = [
        { key: 'groups', label: 'Groups', path: '/groups' },
        { key: 'employees', label: 'Employees', path: '/employees' },
        { key: 'shiftTypes', label: 'Shift Types', path: '/shift-types' },
        { key: 'schedules', label: 'Schedules', path: '/schedules' },
    ] as const;

    return (
        <div className="space-y-6 p-6 border rounded-lg">
            <h4 className="text-lg font-semibold">Progress</h4>
            <p className="text-sm text-muted-foreground">
                Necessary data absent. Groups, Employees and Shift Types are required for creating schedule
            </p>

            <div className="space-y-3">
                {items.map(item => {
                    const exists = entities[item.key];
                    return (
                        <div key={item.key} className="flex items-center justify-between border rounded-md p-3">
                            <div className="flex items-center gap-2">
                                {exists ? (
                                    <Check className="text-green-600 w-5 h-5" />
                                ) : (
                                    <X className="text-red-500 w-5 h-5" />
                                )}
                                <span className="font-medium">{item.label}</span>
                            </div>
                            {!exists && (
                                <Button
                                    size="sm"
                                    onClick={() => router.push(item.path)}
                                >
                                    Create {item.label}
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
