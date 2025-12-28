'use client';

// TanStack Query Provider komponenti - Server-side data fetching uchun
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // QueryClient ni useState ichida yaratish - har render da yangi instance yaratilmasligi uchun
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Stale time - ma'lumotlar qancha vaqt yangi deb hisoblansin
                        staleTime: 1000 * 60 * 5, // 5 daqiqa
                        // Cache time - ma'lumotlar qancha vaqt cache da saqlansin
                        gcTime: 1000 * 60 * 10, // 10 daqiqa (eski cacheTime o'rniga)
                        // Retry - xatolik bo'lganda qancha marta qayta urinish
                        retry: 1,
                        // Refetch on window focus - oyna fokus bo'lganda qayta fetch qilish
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* Development mode da React Query DevTools ko'rsatish */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}

