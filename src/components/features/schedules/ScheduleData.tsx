import ShiftTypeSmallCard from "@/components/ui/cards/ShiftTypeSmallCard";
import EmployeeSmallCard from "@/components/ui/cards/EmployeeSmallCard";
import { EmployeeMinData, ShiftType } from "@/types";
import { ReactNode } from "react";

interface ScheduleDataProps {
    isEditable: boolean;
    layoutPosition: "left" | "top";
    shiftTypes: ShiftType[];
    filteredEmployees: EmployeeMinData[];
    children: ReactNode;
}

export default function ScheduleData({
    isEditable,
    layoutPosition,
    shiftTypes,
    filteredEmployees,
    children,
}: ScheduleDataProps) {
    const showTop = isEditable && layoutPosition === "top";
    const showLeft = isEditable && layoutPosition === "left";

    return (
        <>
            {showTop && (
                <div className="border rounded-lg bg-muted/50 p-4 space-y-3 shrink-0">
                    <div>
                        <h4 className="font-semibold mb-2">Shift Types</h4>
                        <div className="flex gap-2 overflow-x-auto">
                            {shiftTypes.map((st) => (
                                <ShiftTypeSmallCard
                                    key={st.id}
                                    id={st.id}
                                    name={st.name}
                                    startTime={st.startTime}
                                    endTime={st.endTime}
                                    color={st.color}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Employees</h4>
                        <div className="flex gap-2 overflow-x-auto">
                            {filteredEmployees.map((emp) => (
                                <EmployeeSmallCard
                                    key={emp.id}
                                    id={emp.id}
                                    name={emp.name}
                                    position={emp.position}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-1 min-h-0">
                {showLeft && (
                    <aside className="border rounded-lg bg-muted/50 w-64 shrink-0 p-4 space-y-6 border-r overflow-y-auto">
                        <div>
                            <h4 className="font-semibold mb-2">Shift Types</h4>
                            <div className="space-y-2">
                                {shiftTypes.map((st) => (
                                    <ShiftTypeSmallCard
                                        key={st.id}
                                        id={st.id}
                                        name={st.name}
                                        startTime={st.startTime}
                                        endTime={st.endTime}
                                        color={st.color}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Employees</h4>
                            <div className="space-y-2">
                                {filteredEmployees.map((emp) => (
                                    <EmployeeSmallCard
                                        key={emp.id}
                                        id={emp.id}
                                        name={emp.name}
                                        position={emp.position}
                                    />
                                ))}
                            </div>
                        </div>
                    </aside>
                )}
                {children}
            </div>
        </>
    );
}