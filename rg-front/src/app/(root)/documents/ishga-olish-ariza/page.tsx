'use client';

import DocumentForm from '@/components/DocumentForm';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';

export default function IshgaOlishArizaPage() {
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
            <div className="mb-4">
                <button
                    onClick={() => router.push('/documents')}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                    ← Orqaga
                </button>
            </div>
            <DocumentForm documentType="ishga_olish_ariza" />
        </div>
    );
}

