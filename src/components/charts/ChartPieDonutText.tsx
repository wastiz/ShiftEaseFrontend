"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

type ChartDatum = {
    status: string
    phones: number
    fill: string
}

interface ChartPieDonutTextProps {
    data: ChartDatum[]
}

export function ChartPieDonutText({ data }: ChartPieDonutTextProps) {
    const totalPhones = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.phones, 0)
    }, [data])

    const percentageData = data.map(item => ({
        ...item,
        percent: ((item.phones / totalPhones) * 100).toFixed(1),
    }))

    return (
        <div className="flex items-center justify-center h-full gap-6 p-4">

            <div className="flex flex-col gap-3 min-w-[120px]">
                {percentageData.map(item => (
                    <div key={item.status} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{backgroundColor: item.fill}}
                        />
                        <div className="text-sm">
                            <div className="font-medium capitalize">{item.status}</div>
                            <div className="text-muted-foreground text-xs">{item.percent}%</div>
                        </div>
                    </div>
                ))}
            </div>

            <PieChart width={200} height={200}>
                <Pie
                    data={data}
                    dataKey="phones"
                    nameKey="status"
                    innerRadius={60}
                    outerRadius={80}
                    strokeWidth="none"
                >
                    <Label
                        content={({viewBox}) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                    <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                    >
                                        <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="fill-textPrimary text-3xl font-bold"
                                        >
                                            {totalPhones}
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-textPrimary text-sm"
                                        >
                                            Phones
                                        </tspan>
                                    </text>
                                )
                            }
                        }}
                    />
                </Pie>
            </PieChart>
        </div>
    )
}
