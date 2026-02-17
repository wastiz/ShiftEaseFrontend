"use client";
import { ErrorFallback } from "@/lib/ErrorFallback";

export default function EmployeeError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return <ErrorFallback error={error} reset={reset} />;
}
