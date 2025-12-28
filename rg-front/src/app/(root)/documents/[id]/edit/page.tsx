'use client';

import DocumentForm from '@/components/DocumentForm';
import { useRouter, useParams } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { useDocument } from '@/lib/queries/documents';
import { useEffect } from 'react';

export default function DocumentEditPage() {
    const router = useRouter();
    const params = useParams();
    const documentId = Number(params.id);
    const { isAuthenticated, token } = useAppSelector((state) => state.auth);
    const { data: document, isLoading } = useDocument(documentId);

    useEffect(() => {
        const tokenFromStorage = typeof window !== 'undefined'
            ? localStorage.getItem('token')
            : null;

        if (!tokenFromStorage && !isAuthenticated && !token) {
            router.push('/login');
        }
    }, [isAuthenticated, token, router]);

    if (isLoading) {
        return <div className="container mx-auto p-4">Yuklanmoqda...</div>;
    }

    if (!document) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-red-500">Dokument topilmadi</div>
                <button
                    onClick={() => router.push('/documents')}
                    className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                    Orqaga
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 pb-20">
            <div className="mb-4">
                <button
                    onClick={() => router.push(`/documents/${documentId}`)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                    ← Orqaga
                </button>
            </div>
            <DocumentForm documentType={document.document_type} documentId={documentId} />
        </div>
    );
}

