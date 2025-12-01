'use client'
import { useEffect, useRef } from 'react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

export default function EmployeeSmallCard({ id, name }: { id: number; name: string }) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return
        return draggable({
            element: ref.current,
            getInitialData: () => ({ id, type: 'employee', name }),
        })
    }, [])

    return (
        <div
            ref={ref}
            className="cursor-grab rounded border px-3 py-1 text-sm hover:bg-accent"
            data-draggable-id={`employee-${id}`}
        >
    {name}
    </div>
)
}
