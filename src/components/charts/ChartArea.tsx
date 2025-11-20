'use client';

import * as React from 'react';
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis} from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/shadcn/card';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/shadcn/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/shadcn/select';

export const description = 'An interactive area chart';

const chartData = [
    { date: '2024-04-01', balance: 100 },
    { date: '2024-04-02', balance: 100 },
    { date: '2024-04-03', balance: 100 },
    { date: '2024-04-04', balance: 100 },
    { date: '2024-04-05', balance: 100 },
    { date: '2024-04-06', balance: 100 },
    { date: '2024-04-07', balance: 100 },
    { date: '2024-04-08', balance: 100 },
    { date: '2024-04-09', balance: 100 },
    { date: '2024-04-10', balance: 100 },
    { date: '2024-04-11', balance: 100 },
    { date: '2024-04-12', balance: 100 },
    { date: '2024-04-13', balance: 100 },
    { date: '2024-04-14', balance: 100 },
    { date: '2024-04-15', balance: 100 },
    { date: '2024-04-16', balance: 100 },
    { date: '2024-04-17', balance: 100 },
    { date: '2024-04-18', balance: 100 },
    { date: '2024-04-19', balance: 100 },
    { date: '2024-04-20', balance: 100 },
    { date: '2024-04-21', balance: 100 },
    { date: '2024-04-22', balance: 100 },
    { date: '2024-04-23', balance: 100 },
    { date: '2024-04-24', balance: 100 },
    { date: '2024-04-25', balance: 100 },
    { date: '2024-04-26', balance: 100 },
    { date: '2024-04-27', balance: 100 },
    { date: '2024-04-28', balance: 100 },
    { date: '2024-04-29', balance: 100 },
    { date: '2024-04-30', balance: 100 },
    { date: '2024-05-01', balance: 100 },
    { date: '2024-05-02', balance: 100 },
    { date: '2024-05-03', balance: 100 },
    { date: '2024-05-04', balance: 100 },
    { date: '2024-05-05', balance: 100 },
    { date: '2024-05-06', balance: 100 },
    { date: '2024-05-07', balance: 100 },
    { date: '2024-05-08', balance: 100 },
    { date: '2024-05-09', balance: 100 },
    { date: '2024-05-10', balance: 100 },
    { date: '2024-05-11', balance: 100 },
    { date: '2024-05-12', balance: 100 },
    { date: '2024-05-13', balance: 100 },
    { date: '2024-05-14', balance: 100 },
    { date: '2024-05-15', balance: 100 },
    { date: '2024-05-16', balance: 100 },
    { date: '2024-05-17', balance: 100 },
    { date: '2024-05-18', balance: 100 },
    { date: '2024-05-19', balance: 100 },
    { date: '2024-05-20', balance: 100 },
    { date: '2024-05-21', balance: 100 },
    { date: '2024-05-22', balance: 100 },
    { date: '2024-05-23', balance: 100 },
    { date: '2024-05-24', balance: 100 },
    { date: '2024-05-25', balance: 100 },
    { date: '2024-05-26', balance: 100 },
    { date: '2024-05-27', balance: 100 },
    { date: '2024-05-28', balance: 100 },
    { date: '2024-05-29', balance: 100 },
    { date: '2024-05-30', balance: 100 },
    { date: '2024-05-31', balance: 100 },
    { date: '2024-06-01', balance: 100 },
    { date: '2024-06-02', balance: 100 },
    { date: '2024-06-03', balance: 100 },
    { date: '2024-06-04', balance: 100 },
    { date: '2024-06-05', balance: 100 },
    { date: '2024-06-06', balance: 100 },
    { date: '2024-06-07', balance: 100 },
    { date: '2024-06-08', balance: 100 },
    { date: '2024-06-09', balance: 100 },
    { date: '2024-06-10', balance: 100 },
    { date: '2024-06-11', balance: 100 },
    { date: '2024-06-12', balance: 100 },
    { date: '2024-06-13', balance: 100 },
    { date: '2024-06-14', balance: 100 },
    { date: '2024-06-15', balance: 100 },
    { date: '2024-06-16', balance: 100 },
    { date: '2024-06-17', balance: 100 },
    { date: '2024-06-18', balance: 100 },
    { date: '2024-06-19', balance: 100 },
    { date: '2024-06-20', balance: 100 },
    { date: '2024-06-21', balance: 100 },
    { date: '2024-06-22', balance: 100 },
    { date: '2024-06-23', balance: 100 },
    { date: '2024-06-24', balance: 100 },
    { date: '2024-06-25', balance: 100 },
    { date: '2024-06-26', balance: 93 },
    { date: '2024-06-27', balance: 73 },
    { date: '2024-06-28', balance: 28 },
    { date: '2024-06-29', balance: 128 },
    { date: '2024-06-30', balance: 95 },
];

const chartConfig = {
    balance: {
        label: 'Balance',
        color: 'var(--primary)',
    },
} satisfies ChartConfig;

export function ChartArea() {
    const [timeRange, setTimeRange] = React.useState('7d');

    const filteredData = chartData.filter((item) => {
        const date = new Date(item.date);
        const referenceDate = new Date('2024-06-30');
        let daysToSubtract = 7;
        if (timeRange === '30d') {
            daysToSubtract = 30;
        } else if (timeRange === '90d') {
            daysToSubtract = 90;
        }
        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);
        return date >= startDate;
    });

    return (
        <Card className="pt-0 border-0">
            <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle className={'text-medium mb-3'}>
                        Credit Balance Over Time
                    </CardTitle>
                    <CardDescription>Credit balance history</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                        aria-label="Select a value"
                    >
                        <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="90d" className="rounded-lg">
                            Last 3 months
                        </SelectItem>
                        <SelectItem value="30d" className="rounded-lg">
                            Last 30 days
                        </SelectItem>
                        <SelectItem value="7d" className="rounded-lg">
                            Last 7 days
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[200px] w-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient
                                id="fillbalance"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-balance)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-balance)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('en-EU', {
                                    month: 'short',
                                    day: 'numeric',
                                });
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(
                                            value
                                        ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        });
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="balance"
                            type="natural" //  type="linear"
                            fill="url(#fillbalance)"
                            fillOpacity={0.3}
                            stroke="var(--color-balance)"
                            stackId="a"
                        />

                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
