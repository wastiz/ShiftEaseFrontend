"use client";
import { ErrorFallback } from "@/lib/ErrorFallback";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <ErrorFallback error={error} reset={reset} />
            </body>
        </html>
    );
}
