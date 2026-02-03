'use client';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { TrendBadge } from '../../ui/TrendBadge';

import { Card, CardContent } from '@/components/ui/shadcn/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/shadcn/chart';

export const description = 'A line chart';

type Trend = {
    value: number;
    type: 'increase' | 'decrease';
};

const trend: Trend = { value: 200, type: 'increase' };

const chartData = [
    { month: 'January', income: 186 },
    { month: 'February', income: 305 },
    { month: 'March', income: 237 },
    { month: 'April', income: 73 },
    { month: 'May', income: 209 },
    { month: 'June', income: 214 },
];

const chartConfig = {
    income: {
        label: 'income',
        color: 'var(--chart-3)',
    },
} satisfies ChartConfig;

export function ChartLine() {
    return (
        <Card className="bg-glassPrimary min-w-[300px] min-h-[200px]">
            <div className="flex h-full">
                <div className="flex ps-4 flex-col items-start justify-between">
                    <div className="space-y-2">
                        <h1 className="text-xl leading-none font-semibold">
                            Revenue
                        </h1>
                        <p className="text-textSecondary">
                            January - June 2025
                        </p>
                        <div className="text-3xl text-white tracking-tight">
                            $ 100 k
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
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ left: 12, right: 12 }}
                        >
                            <defs>
                                <filter
                                    id="glow-income"
                                    x="-50%"
                                    y="-50%"
                                    width="200%"
                                    height="200%"
                                >
                                    <feGaussianBlur
                                        in="SourceGraphic"
                                        stdDeviation="4"
                                        result="blur"
                                    />
                                    <feComponentTransfer in="blur">
                                        <feFuncA type="linear" slope="2" />
                                    </feComponentTransfer>
                                    <feMerge>
                                        <feMergeNode />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent indicator="line" />
                                }
                            />
                            <Line
                                dataKey="income"
                                type="natural"
                                stroke="var(--color-income)"
                                strokeWidth={2}
                                dot={false}
                                filter="url(#glow-income)" // тут добавляем свечение
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </div>
        </Card>
    );
}
