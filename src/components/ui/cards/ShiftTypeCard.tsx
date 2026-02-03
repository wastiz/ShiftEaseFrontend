import { Card } from "@/components/ui/shadcn/card"
import { Button } from "@/components/ui/shadcn/button"

type ShiftTypeCardAction = {
    label: string
    onClick: () => void
    variant?: "default" | "secondary" | "destructive" | "outline" | "ghost"
}

type ShiftTypeCardProps = {
    name: string
    employees: string
    timeRange: string
    color?: string
    className?: string
    actions?: ShiftTypeCardAction[]
}

export default function ShiftTypeCard({
    name,
    employees,
    timeRange,
    color,
    className = "",
    actions = [],
}: ShiftTypeCardProps) {
    return (
        <Card
            className={`overflow-hidden ${className}`}
            style={{
                ...(color && {
                    borderColor: `${color}80`,
                    borderWidth: "1px",
                }),
            }}
        >
            <div className="p-4 flex flex-col gap-2">
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className="text-sm text-muted-foreground">Employees: <span className={"text-white"}>{employees}</span></p>
                <p className="text-sm text-muted-foreground">Time range: <span className={"text-white"}>{timeRange}</span></p>

                {actions.length > 0 && (
                    <div className="flex gap-2 mt-2">
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                onClick={action.onClick}
                                variant={action.variant ?? "secondary"}
                                size="sm"
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    )
}
