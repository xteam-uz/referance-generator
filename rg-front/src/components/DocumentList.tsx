'use client';

// CLIENT COMPONENT - TanStack Query bilan server-side data fetching

import { useDocuments, useDeleteDocument } from '@/lib/queries/documents';
import { Document } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function DocumentList() {
    const router = useRouter();
    const { data: documents = [], isLoading, error } = useDocuments();
    const deleteMutation = useDeleteDocument();

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
            <h2 className="text-2xl font-bold mb-4">Dokumentlar ro'yxati</h2>
            <div className="grid gap-4">
                {documents.length === 0 ? (
                    <p className="text-gray-500">Hozircha dokument yo'q</p>
                ) : (
                    documents.map((document: Document) => (
                        <div key={document.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-2">
                                        {getDocumentTypeLabel(document.document_type)}
                                    </h3>
                                    {document.personal_information && (
                                        <div className="text-sm text-gray-600 mb-2">
                                            <p>
                                                <strong>F.I.Sh:</strong>{' '}
                                                {document.personal_information.familya}{' '}
                                                {document.personal_information.ism}{' '}
                                                {document.personal_information.sharif}
                                            </p>
                                            <p>
                                                <strong>Tug'ilgan:</strong>{' '}
                                                {new Date(document.personal_information.tugilgan_sana).toLocaleDateString('uz-UZ')}{' '}
                                                ({document.personal_information.tugilgan_joyi})
                                            </p>
                                            <p>
                                                <strong>Ma'lumoti:</strong> {document.personal_information.malumoti}
                                            </p>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-400">
                                        Yaratilgan: {new Date(document.created_at).toLocaleDateString('uz-UZ')}
                                    </p>
                                </div>

                                {/* actions */}
                                <div className="flex gap-2 md:ml-4 flex-wrap">
                                    <button
                                        onClick={() => handleView(document.id)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                    >
                                        Ko'rish
                                    </button>
                                    <button
                                        onClick={() => handleEdit(document.id)}
                                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                    >
                                        Tahrirlash
                                    </button>
                                    <button
                                        onClick={() => handleDownload(document.id)}
                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                    >
                                        Yuklab olish
                                    </button>
                                    <button
                                        onClick={() => handleDelete(document.id)}
                                        disabled={deleteMutation.isPending}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50"
                                    >
                                        {deleteMutation.isPending ? '...' : 'O\'chirish'}
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

