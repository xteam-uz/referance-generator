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
                        <h2 className="text-2xl font-semibold mb-4">Шахсий маълумотлар</h2>

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
                                <strong>Фамилия:</strong> {pi.familya}
                            </div>
                            <div>
                                <strong>Исм:</strong> {pi.ism}
                            </div>
                            <div>
                                <strong>Шариф:</strong> {pi.sharif}
                            </div>
                            <div>
                                <strong>Тўғилган сана:</strong>{' '}
                                {new Date(pi.tugilgan_sana).toLocaleDateString('uz-UZ')}
                            </div>
                            <div>
                                <strong>Тўғилган жойи:</strong> {pi.tugilgan_joyi}
                            </div>
                            <div>
                                <strong>Миллати:</strong> {pi.millati}
                            </div>
                            <div>
                                <strong>Партиявийлиги:</strong> {pi.partiyaviyligi || '-'}
                            </div>
                        </div>
                        {pi.xalq_deputatlari && (
                            <div>
                                <strong>Халқ депутатлари республика, вилоят, шаҳар ва туман Кенгаши депутатими ёки бошқа сайланадиган органларнинг аъзосими:</strong> {pi.xalq_deputatlari}
                            </div>
                        )}
                    </div>
                )}

                {document.work_experiences && document.work_experiences.length > 0 && (
                    <div className="border rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4">Меҳнат фаолияти</h2>
                        <div className="space-y-4">
                            {document.work_experiences.map((workExp, index) => (
                                <div key={index} className="border rounded p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <strong>Бошланган сана:</strong>{' '}
                                            {new Date(workExp.start_date).toLocaleDateString('uz-UZ')}
                                        </div>
                                        <div>
                                            <strong>Тугаган сана:</strong>{' '}
                                            {workExp.end_date
                                                ? new Date(workExp.end_date).toLocaleDateString('uz-UZ')
                                                : 'Ҳозиргача вазифада'}
                                        </div>
                                        <div className="md:col-span-2">
                                            <strong>Иш жойи ва лавозими:</strong> {workExp.info}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {document.education_records && document.education_records.length > 0 && (
                    <div className="border rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4">Маълумоти ва Таълим</h2>
                        <div className="space-y-4">
                            {document.education_records.map((record, index) => (
                                <div key={index} className="border rounded p-4">
                                    <h3 className="font-semibold mb-2">Таълим #{index + 1}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <strong>Маълумоти:</strong> {record.malumoti}
                                        </div>
                                        {record.tamomlagan && (
                                            <div>
                                                <strong>Тамомлаган:</strong> {record.tamomlagan}
                                            </div>
                                        )}
                                        {record.mutaxassisligi && (
                                            <div>
                                                <strong>Мутахассислиги:</strong> {record.mutaxassisligi}
                                            </div>
                                        )}
                                        {record.ilmiy_daraja && (
                                            <div>
                                                <strong>Илмий даража:</strong> {record.ilmiy_daraja}
                                            </div>
                                        )}
                                        {record.ilmiy_unvoni && (
                                            <div>
                                                <strong>Илмий унвони:</strong> {record.ilmiy_unvoni}
                                            </div>
                                        )}
                                        {record.chet_tillari && (
                                            <div>
                                                <strong>Қайси чет тилларини билади:</strong> {record.chet_tillari}
                                            </div>
                                        )}
                                        {record.maxsus_unvoni && (
                                            <div>
                                                <strong>Ҳарбий (махсус) унвони:</strong> {record.maxsus_unvoni}
                                            </div>
                                        )}
                                        {record.davlat_mukofoti && (
                                            <div>
                                                <strong>Давлат мукофотлари:</strong> {record.davlat_mukofoti}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {document.relatives && document.relatives.length > 0 && (
                    <div className="border rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4">Қариндошлари ҳақида маълумот</h2>
                        <div className="space-y-4">
                            {document.relatives.map((relative, index) => (
                                <div key={index} className="border rounded p-4">
                                    <h3 className="font-semibold mb-2">{relative.qarindoshligi}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div><strong>Ф.И.Ш:</strong> {relative.fio}</div>
                                        <div><strong>Тўғилган:</strong> {relative.tugilgan}</div>
                                        <div><strong>Вафот этган:</strong> {relative.vafot_etgan ? 'Ҳа' : 'Йўқ'}</div>
                                        {relative.vafot_etgan ? (
                                            <>
                                                <div><strong>Вафот этган йили:</strong> {relative.vafot_etgan_yili || '-'}</div>
                                                <div><strong>Касби:</strong> {relative.kasbi || '-'}</div>
                                            </>
                                        ) : (
                                            <>
                                                <div><strong>Иш жойи ва лавозими:</strong> {relative.ish_joyi || '-'}</div>
                                                <div className="md:col-span-2"><strong>Турар жойи:</strong> {relative.turar_joyi || '-'}</div>
                                            </>
                                        )}
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


