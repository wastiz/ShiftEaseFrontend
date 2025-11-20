'use client';

import * as React from 'react';
import { Pie, PieChart } from 'recharts';

type ChartDatum = {
    status: string;
    phones: number;
    fill: string;
};

interface ChartPieDonutProps {
    data: ChartDatum[];
}

export function ChartPieDonut({ data }: ChartPieDonutProps) {
    const totalPhones = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.phones, 0);
    }, [data]);

    const percentageData = data.map((item) => ({
        ...item,
        percent: ((item.phones / totalPhones) * 100).toFixed(1),
    }));

    return (
        <div className="flex-auto items-center justify-center h-full gap-6 p-4 xl:flex">
            <PieChart width={250} height={250}>
                <Pie
                    data={data}
                    dataKey="phones"
                    nameKey="status"
                    innerRadius={60}
                    outerRadius={110}
                    strokeWidth="none"
                ></Pie>
            </PieChart>

            <div className="flex xl:flex-col xl:mt-0 mt-5 gap-3 min-w-[100px]">
                {percentageData.map((item) => (
                    <div key={item.status} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                        />
                        <div className="text-sm">
                            <div className="font-medium capitalize">
                                {item.status}
                            </div>
                            <div className="text-muted-foreground text-xs">
                                {item.percent}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
