'use client';

// CLIENT COMPONENT - TanStack Query bilan server-side data fetching

import { useDocuments, useDeleteDocument } from '@/lib/queries/documents';
import { Document } from '@/lib/types';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';

export default function DocumentList() {
    const router = useRouter();
    const { data: documents = [], isLoading, error } = useDocuments();
    const deleteMutation = useDeleteDocument();
    const { isAuthenticated, token } = useAppSelector((state) => state.auth);

    const handleObyektivkaClick = () => {
        const tokenFromStorage = typeof window !== 'undefined'
            ? localStorage.getItem('token')
            : null;

        if (!tokenFromStorage && !isAuthenticated && !token) {
            router.push('/login');
        } else {
            router.push('/documents/obyektivka');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Bu dokumentni o\'chirishni xohlaysizmi?')) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                console.error('Delete error:', error);
                alert('Xatolik: ' + (error instanceof Error ? error.message : 'Noma\'lum xatolik'));
            }
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/documents/${id}/edit`);
    };

    const handleView = (id: number) => {
        router.push(`/documents/${id}`);
    };

    const handleDownload = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Avval tizimga kirishingiz kerak');
                return;
            }

            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
            const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf',
                },
            });

            if (!response.ok) {
                throw new Error('PDF yuklab olishda xatolik');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `document_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            alert('Xatolik: ' + (error instanceof Error ? error.message : 'PDF yuklab olishda xatolik'));
        }
    };

    const getDocumentTypeLabel = (type: string) => {
        switch (type) {
            case 'obyektivka':
                return 'Obyektivka';
            case 'ishga_olish_ariza':
                return 'Ishga olish bo\'yicha ariza';
            case 'kochirish_ariza':
                return 'Ko\'chirish bo\'yicha ariza';
            default:
                return type;
        }
    };

    if (isLoading) {
        return <div className="p-4">Yuklanmoqda...</div>;
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Xatolik: {error instanceof Error ? error.message : 'Ma\'lumotlarni yuklashda xatolik'}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <button
                onClick={handleObyektivkaClick}
                className="block cursor-pointer w-full bg-green-500 text-white text-center py-3 px-4 mb-3 rounded-lg hover:bg-green-600 transition"
            >
                Obyektivka qo'shish
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {documents.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-8">Ҳозирча документ йўқ</p>
                ) : (
                    documents.map((document: Document) => (
                        <div key={document.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition flex flex-col h-full">
                            <div className="flex flex-col flex-1">
                                <h3 className="text-lg font-semibold mb-2">
                                    {getDocumentTypeLabel(document.document_type)}
                                </h3>
                                {document.personal_information && (
                                    <div className="text-sm text-gray-600 mb-2 flex-1">
                                        <p>
                                            <strong>Ф.И.Ш:</strong>{' '}
                                            {document.personal_information.familya}{' '}
                                            {document.personal_information.ism}{' '}
                                            {document.personal_information.sharif}
                                        </p>
                                        <p>
                                            <strong>Тўғилган:</strong>{' '}
                                            {new Date(document.personal_information.tugilgan_sana).toLocaleDateString('uz-UZ')}{' '}
                                            ({document.personal_information.tugilgan_joyi})
                                        </p>
                                        <p>
                                            <strong>Маълумоти:</strong> {document.education_records?.[0]?.malumoti || 'Маълумот топилмади'}
                                        </p>
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 mb-3">
                                    Яратилган: {new Date(document.created_at).toLocaleDateString('uz-UZ')}
                                </p>

                                {/* actions */}
                                <div className="flex flex-col gap-2 mt-auto">
                                    <button
                                        onClick={() => handleView(document.id)}
                                        className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                    >
                                        Кўриш
                                    </button>
                                    <button
                                        onClick={() => handleEdit(document.id)}
                                        className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                    >
                                        Таҳрирлаш
                                    </button>
                                    <button
                                        onClick={() => handleDownload(document.id)}
                                        className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                    >
                                        Юклаб олиш
                                    </button>
                                    <button
                                        onClick={() => handleDelete(document.id)}
                                        disabled={deleteMutation.isPending}
                                        className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50"
                                    >
                                        {deleteMutation.isPending ? '...' : 'Ўчириш'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

