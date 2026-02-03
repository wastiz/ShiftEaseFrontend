import { Clock } from "lucide-react"
import { Card } from "@/components/ui/shadcn/card"
import { Button } from "@/components/ui/shadcn/button"

type GroupCardAction = {
    label: string
    onClick: () => void
    variant?: "default" | "secondary" | "destructive" | "outline" | "ghost"
}

type GroupCardProps = {
    name: string
    description?: string
    color: string
    workingHours?: string
    className?: string
    actions?: GroupCardAction[]
}

export default function GroupCard({
    name,
    description,
    color,
    workingHours,
    className = "",
    actions = [],
}: GroupCardProps) {
    return (
        <Card
            className={`overflow-hidden ${className}`}
            style={{
                borderColor: `${color}80`,
                borderWidth: "1px",
            }}
        >
            <div className="p-4 flex flex-col gap-2">
                {/* Color indicator + name */}
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                    />
                    <h3 className="text-lg font-semibold">{name}</h3>
                </div>

                {/* Description */}
                {description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Working hours */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-white">{workingHours}</span>
                </div>

                {/* Actions */}
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
