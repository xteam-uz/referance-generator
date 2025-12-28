'use client';

import DocumentList from '@/components/DocumentList';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';

export default function DocumentsPage() {
    const router = useRouter();
    const { isAuthenticated, token } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const tokenFromStorage = typeof window !== 'undefined'
            ? localStorage.getItem('token')
            : null;

        if (!tokenFromStorage && !isAuthenticated && !token) {
            router.push('/login');
        }
    }, [isAuthenticated, token, router]);

    return (
        <div className="container mx-auto p-4 pb-20">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Dokumentlar</h1>
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Bosh sahifaga qaytish
                </button>
            </div>
            <DocumentList />
        </div>
    );
}

