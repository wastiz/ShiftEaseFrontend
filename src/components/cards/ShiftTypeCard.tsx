'use client'
import { useEffect, useRef } from 'react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

export default function ShiftTypeCard({ type, id, startTime, endTime}: { type: string; id: number, startTime: string, endTime: string }) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return
        return draggable({
            element: ref.current,
            getInitialData: () => ({ id, type: 'shiftType', name: type }),
        })
    }, [])

    return (
        <div
            ref={ref}
            className="cursor-grab rounded border px-3 py-1 text-sm hover:bg-accent mb-2"
            data-draggable-id={`shiftType-${id}`}
        >
            {type} {startTime} - {endTime}
        </div>
    )
}
