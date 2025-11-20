'use client';

import { TrendingUp } from 'lucide-react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
} from 'recharts';

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
import { TrendBadge } from '../../ui/TrendBadge';

export const description = 'A multiple line chart';

type Trend = {
    value: number;
    type: 'increase' | 'decrease';
};

const trend: Trend = { value: 200, type: 'increase' };

const chartData = [
    { month: 'January', valid: 186, invalid: 80, risky: 200 },
    { month: 'February', valid: 210, invalid: 95, risky: 180 },
    { month: 'March', valid: 160, invalid: 75, risky: 220 },
    { month: 'April', valid: 195, invalid: 60, risky: 170 },
    { month: 'May', valid: 240, invalid: 100, risky: 190 },
    { month: 'June', valid: 200, invalid: 85, risky: 210 },
];

const chartConfig = {
    valid: {
        label: 'Valid',
        color: 'var(--chart-1)',
    },
    invalid: {
        label: 'Invalid',
        color: 'var(--chart-2)',
    },
    risky: {
        label: 'Risky',
        color: 'var(--chart-5)',
    },
} satisfies ChartConfig;

export function MultipleLineChart() {
    return (
        <Card className="border-0 pb-0">
            <CardHeader>
                <CardTitle>
                    <div className="flex items-start justify-between">
                        <p>Line Chart - Multiple</p>
                        {trend && <TrendBadge trend={trend} />}
                    </div>
                </CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
                <ChartContainer
                    config={chartConfig}
                    className={'h-full w-full'}
                >
                    <ResponsiveContainer width="100%" height={'50%'}>
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                top: 20,
                                bottom: 20,
                                left: 12,
                                right: 12,
                            }}
                        >
                            <defs>
                                <filter
                                    id="glow-valid"
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
                                <filter
                                    id="glow-invalid"
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
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                                <filter
                                    id="glow-risky"
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
                                        <feMergeNode in="blur" />
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
                                content={<ChartTooltipContent />}
                            />

                            <Line
                                dataKey="valid"
                                type="monotone"
                                stroke="var(--chart-1)"
                                strokeWidth={2}
                                dot={false}
                                filter="url(#glow-valid)"
                            />
                            <Line
                                dataKey="invalid"
                                type="monotone"
                                stroke="var(--chart-2)"
                                strokeWidth={2}
                                dot={false}
                                filter="url(#glow-invalid)"
                            />
                            <Line
                                dataKey="risky"
                                type="monotone"
                                stroke="var(--chart-5)"
                                strokeWidth={2}
                                dot={false}
                                filter="url(#glow-risky)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
