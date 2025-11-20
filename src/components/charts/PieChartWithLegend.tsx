"use client"

import { Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/shadcn/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/shadcn/chart"
import {PieChartData} from "@/types";

type ChartPieLegendProps = {
    title?: string
    description?: string
    data: PieChartData[]
}

export function PieChartWithLegend({ title = "Pie Chart", description, data }: ChartPieLegendProps) {
    const chartConfig = data.reduce((acc, item) => {
        acc[item.label] = { label: item.label, color: item.fill || "var(--chart-1)" }
        return acc
    }, {} as ChartConfig)

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="label" />
                        <ChartLegend
                            content={<ChartLegendContent nameKey="label" />}
                            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
