'use client';

import { Button } from "@/components/ui/shadcn/button";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { CheckEntitiesResult } from "@/types";

const requiredEntities: Array<{
    key: keyof Pick<CheckEntitiesResult, 'groups' | 'employees' | 'shiftTypes'>;
    label: string;
    path: string;
}> = [
    { key: 'groups', label: 'Groups', path: '/groups' },
    { key: 'employees', label: 'Employees', path: '/employees' },
    { key: 'shiftTypes', label: 'Shift Types', path: '/shift-types' },
];

interface EntityCheckResultProps {
    entities?: CheckEntitiesResult;
}

export default function EntityCheckResult({ entities }: EntityCheckResultProps) {
    const router = useRouter();

    if (!entities) return null;

    return (
        <div className="space-y-6 p-6 border rounded-lg">
            <h4 className="text-lg font-semibold">Progress</h4>
            <p className="text-sm text-muted-foreground">
                Necessary data absent. Groups, Employees and Shift Types are required for creating schedule
            </p>

            <div className="space-y-3">
                {requiredEntities.map(item => {
                    const exists = entities[item.key];

                    return (
                        <div
                            key={item.key}
                            className="flex items-center justify-between border rounded-md p-3"
                        >
                            <div className="flex items-center gap-2">
                                {exists ? (
                                    <Check className="text-green-600 w-5 h-5" />
                                ) : (
                                    <X className="text-red-500 w-5 h-5" />
                                )}
                                <span className="font-medium">{item.label}</span>
                            </div>

                            {!exists && (
                                <Button size="sm" onClick={() => router.push(item.path)}>
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
