'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/shadcn/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/shadcn/chart';

export const description = 'A bar chart with a label';

interface ChartDataItem {
    day: string;
    Verified: number;
}

interface ChartBarProps {
    data: ChartDataItem[];
}

const chartConfig: ChartConfig = {
    Verified: {
        label: 'Verified',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

export function ChartBar({ data }: ChartBarProps) {
    return (
        <Card className="border-0 h-full">
            {/* <CardHeader>
                <CardTitle>Verifications in Last 2 Weeks</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader> */}
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            top: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                            dataKey="Verified"
                            fill="var(--color-primary)"
                            radius={8}
                        >
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up by 5.2% this month
                    <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing total visitors for the last x weeks
                </div>
            </CardFooter>
        </Card>
    );
}
