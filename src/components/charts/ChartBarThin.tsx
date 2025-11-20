'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { TrendBadge } from '../../ui/TrendBadge';

import { Card, CardContent } from '@/components/ui/shadcn/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/shadcn/chart';

export const description = 'A thin bar chart';

type Trend = {
    value: number;
    type: 'increase' | 'decrease';
};

const trend: Trend = { value: 200, type: 'increase' };

const chartData = [
    { day: 'Monday', connection: 186 },
    { day: 'Tuesday', connection: 305 },
    { day: 'Wednesday', connection: 237 },
    { day: 'Thursday', connection: 73 },
    { day: 'Friday', connection: 209 },
    { day: 'Saturday', connection: 214 },
];

const chartConfig = {
    connection: {
        label: 'connections',
        color: 'var(--chart-3)',
    },
} satisfies ChartConfig;

export function ChartBarThin() {
    return (
        <Card className="bg-glassPrimary min-w-[300px] min-h-[200px]">
            <div className="flex h-full">
                <div className="flex ps-4 flex-col items-start justify-between">
                    <div className="space-y-2">
                        <h1 className="text-xl leading-none font-semibold">
                            Connection Rate
                        </h1>
                        <p className="text-textSecondary">Weekly report</p>
                        <div className="text-3xl text-white tracking-tight">
                            29%
                        </div>
                    </div>
                    {trend && <TrendBadge trend={trend} />}
                </div>

                {/* Right side 3/5 */}
                <CardContent className="w-3/5 h-full">
                    <ChartContainer
                        config={chartConfig}
                        className="h-full w-full"
                    >
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            barCategoryGap="50%"
                            barSize={10}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="day"
                                tickMargin={10}
                                axisLine={false}
                                interval="preserveStart"
                                tickFormatter={(value) => value.slice(0, 2)}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent indicator="line" />
                                }
                            />
                            <Bar
                                dataKey="connection"
                                fill="var(--color-connection)"
                                radius={4}
                                barSize={10}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </div>
        </Card>
    );
}
