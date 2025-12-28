'use client';

import { useDocument } from '@/lib/queries/documents';
import { useRouter, useParams } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';
import { getStorageUrl } from '@/lib/api';

export default function DocumentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const documentId = Number(params.id);
    const { isAuthenticated, token } = useAppSelector((state) => state.auth);
    const { data: document, isLoading, error } = useDocument(documentId);

    useEffect(() => {
        const tokenFromStorage = typeof window !== 'undefined'
            ? localStorage.getItem('token')
            : null;

        if (!tokenFromStorage && !isAuthenticated && !token) {
            router.push('/login');
        }
    }, [isAuthenticated, token, router]);

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
        return <div className="container mx-auto p-4">Yuklanmoqda...</div>;
    }

    if (error || !document) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-red-500">
                    Xatolik: {error instanceof Error ? error.message : 'Dokument topilmadi'}
                </div>
                <button
                    onClick={() => router.push('/documents')}
                    className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                    Orqaga
                </button>
            </div>
        );
    }

    const pi = document.personal_information;

    return (
        <div className="container mx-auto p-4 pb-20">
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => router.push('/documents')}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                    ← Orqaga
                </button>
                <button
                    onClick={() => router.push(`/documents/${documentId}/edit`)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    Tahrirlash
                </button>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">{getDocumentTypeLabel(document.document_type)}</h1>

                {pi && (
                    <div className="border rounded-lg p-6 space-y-4">
                        <h2 className="text-2xl font-semibold mb-4">Shaxsiy ma'lumotlar</h2>

                        {pi.photo_path && (
                            <div className="mb-4">
                                <img
                                    src={getStorageUrl(pi.photo_path || '')}
                                    alt="Photo"
                                    className="w-32 h-40 object-cover rounded"
                                    onError={(e) => {
                                        console.error('Image load error:', pi.photo_path);
                                        console.error('Full URL:', getStorageUrl(pi.photo_path || ''));
                                    }}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <strong>Familya:</strong> {pi.familya}
                            </div>
                            <div>
                                <strong>Ism:</strong> {pi.ism}
                            </div>
                            <div>
                                <strong>Sharif:</strong> {pi.sharif}
                            </div>
                            <div>
                                <strong>Tug'ilgan sana:</strong>{' '}
                                {new Date(pi.tugilgan_sana).toLocaleDateString('uz-UZ')}
                            </div>
                            <div>
                                <strong>Tug'ilgan joyi:</strong> {pi.tugilgan_joyi}
                            </div>
                            <div>
                                <strong>Millati:</strong> {pi.millati}
                            </div>
                            <div>
                                <strong>Ma'lumoti:</strong> {pi.malumoti}
                            </div>
                            <div>
                                <strong>Partiyaviyligi:</strong> {pi.partiyaviyligi || '-'}
                            </div>
                            <div>
                                <strong>Ma'lumoti bo'yicha mutaxassisligi:</strong> {pi.malumoti_boyicha_mutaxassisligi || '-'}
                            </div>
                            <div>
                                <strong>Qaysi chet tillarini biladi:</strong> {pi.qaysi_chet_tillarini_biladi || '-'}
                            </div>
                            <div>
                                <strong>Joriy lavozim sanasi:</strong> {pi.joriy_lavozim_sanasi}
                            </div>
                        </div>
                        <div>
                            <strong>Joriy lavozim to'liq:</strong> {pi.joriy_lavozim_toliq}
                        </div>
                        {pi.xalq_deputatlari && (
                            <div>
                                <strong>Xalq deputatlari respublika, viloyat, shahar va tuman Kengashi deputatimi yoki boshqa saylanadigan organlarning a'zosimi:</strong> {pi.xalq_deputatlari}
                            </div>
                        )}
                    </div>
                )}

                {document.education_records && document.education_records.length > 0 && (
                    <div className="border rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4">Tamomlagan</h2>
                        <ul className="list-disc list-inside space-y-2">
                            {document.education_records.map((record, index) => (
                                <li key={index}>{record.description}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {document.relatives && document.relatives.length > 0 && (
                    <div className="border rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4">Qarindoshlari haqida ma'lumot</h2>
                        <div className="space-y-4">
                            {document.relatives.map((relative, index) => (
                                <div key={index} className="border rounded p-4">
                                    <h3 className="font-semibold mb-2">{relative.qarindoshligi}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div><strong>F.I.Sh:</strong> {relative.fio}</div>
                                        <div><strong>Tug'ilgan:</strong> {relative.tugilgan}</div>
                                        <div><strong>Vafot etgan:</strong> {relative.vafot_etgan ? 'Ha' : 'Yo\'q'}</div>
                                        <div><strong>Ish joyi:</strong> {relative.ish_joyi}</div>
                                        <div className="md:col-span-2"><strong>Turar joyi:</strong> {relative.turar_joyi}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

