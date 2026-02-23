"use client";
import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
//import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {ReactNode, useState} from 'react';

interface Props {
    children: ReactNode;
}

export default function TanstackProvider({ children }: Props) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <QueryErrorResetBoundary>
                {children}
            </QueryErrorResetBoundary>
            {/* <ReactQueryDevtools initialIsOpen={false} position="bottom-right" /> */}
        </QueryClientProvider>
    );
}
