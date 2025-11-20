import {DateData} from "@/types";

export function getDaysInMonth(year: number, month: number): DateData[] {
    return Array.from(
        { length: new Date(year, month + 1, 0).getDate() },
        (_, i) => {
            const date = new Date(year, month, i + 1);
            const isoDate = date.toISOString().split('T')[0];                     // YYYY-MM-DD
            const day = date.getDate().toString().padStart(2, '0');               // 01
            const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');   // 10
            const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue, ...

            const label = `${day}.${monthStr} ${weekday}`;
            return { isoDate, label };
        }
    );
}
