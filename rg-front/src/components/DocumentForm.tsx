'use client';

// CLIENT COMPONENT - TanStack Query bilan form boshqarish

import { useState, useEffect } from 'react';
import { useCreateDocument, useUpdateDocument, useDocument } from '@/lib/queries/documents';
import { CreateDocumentDto, UpdateDocumentDto, Document, EducationLevel, RelativeType } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { getStorageUrl } from '@/lib/api';

interface DocumentFormProps {
    documentType: 'obyektivka' | 'ishga_olish_ariza' | 'kochirish_ariza';
    documentId?: number; // Edit mode uchun
}

export default function DocumentForm({ documentType, documentId }: DocumentFormProps) {
    const router = useRouter();
    const createMutation = useCreateDocument();
    const updateMutation = useUpdateDocument();
    const { data: existingDocument, isLoading: isLoadingDocument } = useDocument(documentId || 0);

    const [message, setMessage] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateDocumentDto>({
        document_type: documentType,
        personal_information: {
            familya: '',
            ism: '',
            sharif: '',
            tugilgan_sana: new Date(),
            tugilgan_joyi: '',
            millati: '',
            partiyaviyligi: '',
            xalq_deputatlari: '',
        },
        work_experiences: [{
            start_date: new Date(),
            end_date: null,
            info: '',
        }],
        education_records: [{
            malumoti: 'Олий',
            tamomlagan: '',
            mutaxassisligi: '',
            ilmiy_daraja: '',
            ilmiy_unvoni: '',
            chet_tillari: '',
            maxsus_unvoni: '',
            davlat_mukofoti: '',
        }],
        relatives: [{
            qarindoshligi: 'Otasi',
            fio: '',
            tugilgan: '',
            vafot_etgan: false,
            ish_joyi: '',
            turar_joyi: '',
            vafot_etgan_yili: '',
            kasbi: '',
        }],
    });

    // Existing document ni yuklash
    useEffect(() => {
        if (existingDocument && documentId) {
            const pi = existingDocument.personal_information;
            if (pi) {
                setFormData({
                    document_type: existingDocument.document_type,
                    personal_information: {
                        familya: pi.familya,
                        ism: pi.ism,
                        sharif: pi.sharif,
                        tugilgan_sana: new Date(pi.tugilgan_sana),
                        tugilgan_joyi: pi.tugilgan_joyi,
                        millati: pi.millati,
                        partiyaviyligi: pi.partiyaviyligi || '',
                        xalq_deputatlari: pi.xalq_deputatlari || '',
                    },
                    work_experiences: existingDocument.work_experiences?.map(we => ({
                        start_date: new Date(we.start_date),
                        end_date: we.end_date ? new Date(we.end_date) : null,
                        info: we.info,
                    })) || [{
                        start_date: new Date(),
                        end_date: null,
                        info: '',
                    }],
                    education_records: existingDocument.education_records?.map(er => ({
                        malumoti: er.malumoti,
                        tamomlagan: er.tamomlagan || '',
                        mutaxassisligi: er.mutaxassisligi || '',
                        ilmiy_daraja: er.ilmiy_daraja || '',
                        ilmiy_unvoni: er.ilmiy_unvoni || '',
                        chet_tillari: er.chet_tillari || '',
                        maxsus_unvoni: er.maxsus_unvoni || '',
                        davlat_mukofoti: er.davlat_mukofoti || '',
                    })) || [{
                        malumoti: 'Олий',
                        tamomlagan: '',
                        mutaxassisligi: '',
                        ilmiy_daraja: '',
                        ilmiy_unvoni: '',
                        chet_tillari: '',
                        maxsus_unvoni: '',
                        davlat_mukofoti: '',
                    }],
                    relatives: existingDocument.relatives?.map(r => ({
                        qarindoshligi: r.qarindoshligi,
                        fio: r.fio,
                        tugilgan: r.tugilgan,
                        vafot_etgan: r.vafot_etgan,
                        ish_joyi: r.ish_joyi || '',
                        turar_joyi: r.turar_joyi || '',
                        vafot_etgan_yili: r.vafot_etgan_yili || '',
                        kasbi: r.kasbi || '',
                    })) || [{
                        qarindoshligi: 'Otasi',
                        fio: '',
                        tugilgan: '',
                        vafot_etgan: false,
                        ish_joyi: '',
                        turar_joyi: '',
                        vafot_etgan_yili: '',
                        kasbi: '',
                    }],
                });

                if (pi.photo_path) {
                    setPhotoPreview(getStorageUrl(pi.photo_path));
                }
            }
        }
    }, [existingDocument, documentId]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addWorkExperience = () => {
        setFormData({
            ...formData,
            work_experiences: [...formData.work_experiences, {
                start_date: new Date(),
                end_date: null,
                info: '',
            }],
        });
    };

    const removeWorkExperience = (index: number) => {
        if (formData.work_experiences.length > 1) {
            const newExperiences = formData.work_experiences.filter((_, i) => i !== index);
            setFormData({ ...formData, work_experiences: newExperiences });
        }
    };

    const addEducationRecord = () => {
        setFormData({
            ...formData,
            education_records: [...formData.education_records, {
                malumoti: 'Олий',
                tamomlagan: '',
                mutaxassisligi: '',
                ilmiy_daraja: '',
                ilmiy_unvoni: '',
                chet_tillari: '',
                maxsus_unvoni: '',
                davlat_mukofoti: '',
            }],
        });
    };

    const removeEducationRecord = (index: number) => {
        if (formData.education_records.length > 1) {
            const newRecords = formData.education_records.filter((_, i) => i !== index);
            setFormData({ ...formData, education_records: newRecords });
        }
    };

    const addRelative = () => {
        setFormData({
            ...formData,
            relatives: [...formData.relatives, {
                qarindoshligi: 'Otasi',
                fio: '',
                tugilgan: '',
                vafot_etgan: false,
                ish_joyi: '',
                turar_joyi: '',
            }],
        });
    };

    const removeRelative = (index: number) => {
        if (formData.relatives.length > 1) {
            const newRelatives = formData.relatives.filter((_, i) => i !== index);
            setFormData({ ...formData, relatives: newRelatives });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        try {
            const submitData: CreateDocumentDto = {
                ...formData,
                photo: photoFile || undefined,
            };

            if (documentId) {
                // Update
                await updateMutation.mutateAsync({
                    id: documentId,
                    data: submitData as UpdateDocumentDto,
                });
                setMessage('Muvaffaqiyatli yangilandi!');
                setTimeout(() => {
                    router.push('/documents');
                }, 1500);
            } else {
                // Create
                await createMutation.mutateAsync(submitData);
                setMessage('Muvaffaqiyatli qo\'shildi!');
                // Formni tozalash
                setFormData({
                    document_type: documentType,
                    personal_information: {
                        familya: '',
                        ism: '',
                        sharif: '',
                        tugilgan_sana: new Date(),
                        tugilgan_joyi: '',
                        millati: '',
                        partiyaviyligi: '',
                        xalq_deputatlari: '',
                    },
                    work_experiences: [{
                        start_date: new Date(),
                        end_date: null,
                        info: '',
                    }],
                    education_records: [{
                        malumoti: 'Олий',
                        tamomlagan: '',
                        mutaxassisligi: '',
                        ilmiy_daraja: '',
                        ilmiy_unvoni: '',
                        chet_tillari: '',
                        maxsus_unvoni: '',
                        davlat_mukofoti: '',
                    }],
                    relatives: [{
                        qarindoshligi: 'Otasi',
                        fio: '',
                        tugilgan: '',
                        vafot_etgan: false,
                        ish_joyi: '',
                        turar_joyi: '',
                    }],
                });
                setPhotoFile(null);
                setPhotoPreview(null);
            }
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Xatolik yuz berdi');
        }
    };

    if (documentId && isLoadingDocument) {
        return <div className="p-4">Yuklanmoqda...</div>;
    }

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="container py-4">
            <h1 className="text-center text-2xl font-bold mb-4">
                {documentId ? documentType === 'obyektivka'
                    ? 'Obyektivka' : documentType === 'ishga_olish_ariza'
                        ? 'Ishga olish arizasi' : documentType === 'kochirish_ariza'
                            ? 'Ko\'chirish arizasi' : 'Dokumentni tahrirlash' : 'Obyektivka'}
            </h1>

            <form onSubmit={handleSubmit} className="pt-3">
                <h4 className="pb-2 text-lg font-semibold mb-4">Маълумотларингизни киритинг:</h4>

                {/* Personal Information Section */}
                <div className="flex flex-col md:flex-row gap-0 md:gap-4 mb-4">
                    <div className="flex-1 mb-4 md:mb-4">
                        <label htmlFor="Familya" className="block mb-2">
                            Фамилия <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="Familya"
                            required
                            placeholder="Мисол: Абдуллаев"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.personal_information.familya}
                            onChange={(e) => setFormData({
                                ...formData,
                                personal_information: { ...formData.personal_information, familya: e.target.value }
                            })}
                        />
                    </div>

                    <div className="flex-1 mb-4 md:mb-4">
                        <label htmlFor="Ism" className="block mb-2">
                            Исм <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="Ism"
                            required
                            placeholder="Мисол: Ботир"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.personal_information.ism}
                            onChange={(e) => setFormData({
                                ...formData,
                                personal_information: { ...formData.personal_information, ism: e.target.value }
                            })}
                        />
                    </div>

                    <div className="flex-1 mb-4 md:mb-4">
                        <label htmlFor="Sharif" className="block mb-2">
                            Шариф <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="Sharif"
                            required
                            placeholder="Мисол: Баходирович"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.personal_information.sharif}
                            onChange={(e) => setFormData({
                                ...formData,
                                personal_information: { ...formData.personal_information, sharif: e.target.value }
                            })}
                        />
                    </div>
                </div>

                {/* Rasm */}
                <div className="mb-4">
                    <label htmlFor="Rasm" className="block mb-2">
                        Расм (3x4) {!documentId && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="file"
                        id="Rasm"
                        required={!documentId && !photoPreview}
                        accept="image/jpg,image/jpeg,image/png"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handlePhotoChange}
                    />
                    {photoPreview && (
                        <div className="mt-2">
                            <img src={photoPreview} alt="Preview" className="w-32 h-40 object-cover rounded border" />
                        </div>
                    )}
                    <small className="text-gray-500 text-sm">Format: .jpg,.jpeg,.png Max: 5MB</small>
                </div>

                <div className="mb-4">
                    <label htmlFor="Tugilgansana" className="block mb-2">
                        Тўғилган сана <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="Tugilgansana"
                        value={formData.personal_information.tugilgan_sana.toISOString().split('T')[0]}
                        onChange={(e) => setFormData({
                            ...formData,
                            personal_information: { ...formData.personal_information, tugilgan_sana: new Date(e.target.value as string) }
                        })}
                    />
                    <small className="text-gray-500 text-sm">Format: oy/kun/yil</small>
                </div>

                <div className="mb-4">
                    <label htmlFor="Tugilganjoyi" className="block mb-2">
                        Тўғилган жойи <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="Мисол: Қашқадарё вилояти, Қарши тумани"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="Tugilganjoyi"
                        value={formData.personal_information.tugilgan_joyi}
                        onChange={(e) => setFormData({
                            ...formData,
                            personal_information: { ...formData.personal_information, tugilgan_joyi: e.target.value }
                        })}
                    />
                </div>

                {/* Millati va ma'lumoti */}
                <div className="flex flex-col md:flex-row gap-0 md:gap-4 mb-4">
                    <div className="flex-1 mb-4 md:mb-4">
                        <label htmlFor="Millati" className="block mb-2">
                            Миллати <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Мисол: ўзбек"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="Millati"
                            value={formData.personal_information.millati}
                            onChange={(e) => setFormData({
                                ...formData,
                                personal_information: { ...formData.personal_information, millati: e.target.value }
                            })}
                        />
                    </div>

                </div>

                {/* Partiyaviyligi */}
                <div className="mb-4">
                    <label htmlFor="Partiyaviyligi" className="block mb-2">
                        Партиявийлиги
                    </label>
                    <input
                        type="text"
                        id="Partiyaviyligi"
                        placeholder="Мисол: Ўзбекистон Либерал Демократик Партияси аъзоси"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.personal_information.partiyaviyligi || ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            personal_information: { ...formData.personal_information, partiyaviyligi: e.target.value }
                        })}
                    />
                </div>

                {/* Mehnat Faoliyati */}
                <div className="mb-4">
                    <label className="block mb-2 font-semibold">Меҳнат фаолияти</label>
                    {formData.work_experiences.map((workExp, index) => (
                        <div key={index} className="mb-4 p-4 border border-gray-300 rounded">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">Иш тарихи #{index + 1}</h4>
                                {index > 0 && (
                                    <button
                                        type="button"
                                        className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                                        aria-label="Remove"
                                        onClick={() => removeWorkExperience(index)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                <div>
                                    <label className="block mb-1 text-sm">Бошланган сана <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={workExp.start_date.toISOString().split('T')[0]}
                                        onChange={(e) => {
                                            const newExperiences = [...formData.work_experiences];
                                            newExperiences[index].start_date = new Date(e.target.value);
                                            setFormData({ ...formData, work_experiences: newExperiences });
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm">Тугаган сана</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={workExp.end_date ? workExp.end_date.toISOString().split('T')[0] : ''}
                                        onChange={(e) => {
                                            const newExperiences = [...formData.work_experiences];
                                            newExperiences[index].end_date = e.target.value ? new Date(e.target.value) : null;
                                            setFormData({ ...formData, work_experiences: newExperiences });
                                        }}
                                    />
                                    <label className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            checked={!workExp.end_date}
                                            onChange={(e) => {
                                                const newExperiences = [...formData.work_experiences];
                                                newExperiences[index].end_date = e.target.checked ? null : new Date();
                                                setFormData({ ...formData, work_experiences: newExperiences });
                                            }}
                                        />
                                        <span className="text-sm">Ҳозиргача вазифада</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm">Иш жойи ва лавозими <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Мисол: &quot;UzAuto Motors&quot; акциядорлик жамияти ишлаб чиқаришни таъминлаш бошқармаси 2-таъминот бўлими консолидация бўлинмаси бошлиғи"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={workExp.info}
                                    onChange={(e) => {
                                        const newExperiences = [...formData.work_experiences];
                                        newExperiences[index].info = e.target.value;
                                        setFormData({ ...formData, work_experiences: newExperiences });
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="w-full px-3 py-2 mt-2 border border-gray-300 rounded bg-white hover:bg-gray-400 text-sm text-gray-500 hover:text-white"
                        onClick={addWorkExperience}
                    >
                        Иш тарихи қўшиш
                    </button>
                </div>

                {/* Ma'lumoti va Ta'lim */}
                <div className="mb-4">
                    <label className="block mb-2 font-semibold">Маълумоти ва Таълим</label>

                    {formData.education_records.map((record, index) => (
                        <div key={index} className="mb-4 p-4 border border-gray-300 rounded">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">Таълим #{index + 1}</h4>
                                {index > 0 && (
                                    <button
                                        type="button"
                                        className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                                        aria-label="Remove"
                                        onClick={() => removeEducationRecord(index)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 text-sm">Маълумоти <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={record.malumoti}
                                    onChange={(e) => {
                                        const newRecords = [...formData.education_records];
                                        newRecords[index].malumoti = e.target.value as EducationLevel;
                                        setFormData({ ...formData, education_records: newRecords });
                                    }}
                                >
                                    <option value="Олий">Олий</option>
                                    <option value="Махсус">Махсус</option>
                                    <option value="Ўрта">Ўрта</option>
                                </select>
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 text-sm">Тамомлаган</label>
                                <input
                                    type="text"
                                    placeholder="Мисол: 2006 й. Фарғона политехника институти (сиртқи)"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={record.tamomlagan || ''}
                                    onChange={(e) => {
                                        const newRecords = [...formData.education_records];
                                        newRecords[index].tamomlagan = e.target.value;
                                        setFormData({ ...formData, education_records: newRecords });
                                    }}
                                />
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 text-sm">Мутахассислиги</label>
                                <input
                                    type="text"
                                    placeholder="Мисол: технологик машина ва жихозлар"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={record.mutaxassisligi || ''}
                                    onChange={(e) => {
                                        const newRecords = [...formData.education_records];
                                        newRecords[index].mutaxassisligi = e.target.value;
                                        setFormData({ ...formData, education_records: newRecords });
                                    }}
                                />
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 text-sm">Илмий даража</label>
                                <input
                                    type="text"
                                    placeholder="Мисол: фалсафа фанлари номзоди (2003)"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={record.ilmiy_daraja || ''}
                                    onChange={(e) => {
                                        const newRecords = [...formData.education_records];
                                        newRecords[index].ilmiy_daraja = e.target.value;
                                        setFormData({ ...formData, education_records: newRecords });
                                    }}
                                />
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 text-sm">Илмий унвони</label>
                                <input
                                    type="text"
                                    placeholder="Мисол: доцент (2005)"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={record.ilmiy_unvoni || ''}
                                    onChange={(e) => {
                                        const newRecords = [...formData.education_records];
                                        newRecords[index].ilmiy_unvoni = e.target.value;
                                        setFormData({ ...formData, education_records: newRecords });
                                    }}
                                />
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 text-sm">Қайси чет тилларини билади</label>
                                <input
                                    type="text"
                                    placeholder="Мисол: рус тили"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={record.chet_tillari || ''}
                                    onChange={(e) => {
                                        const newRecords = [...formData.education_records];
                                        newRecords[index].chet_tillari = e.target.value;
                                        setFormData({ ...formData, education_records: newRecords });
                                    }}
                                />
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 text-sm">Ҳарбий (махсус) унвони</label>
                                <input
                                    type="text"
                                    placeholder="Мисол: капитан"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={record.maxsus_unvoni || ''}
                                    onChange={(e) => {
                                        const newRecords = [...formData.education_records];
                                        newRecords[index].maxsus_unvoni = e.target.value;
                                        setFormData({ ...formData, education_records: newRecords });
                                    }}
                                />
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 text-sm">Давлат мукофотлари</label>
                                <input
                                    type="text"
                                    placeholder="Мисол: Мустақиллик ордени (2011)"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={record.davlat_mukofoti || ''}
                                    onChange={(e) => {
                                        const newRecords = [...formData.education_records];
                                        newRecords[index].davlat_mukofoti = e.target.value;
                                        setFormData({ ...formData, education_records: newRecords });
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="w-full px-3 py-2 mt-2 border border-gray-300 rounded bg-white hover:bg-gray-400 text-sm text-gray-500 hover:text-white"
                        onClick={addEducationRecord}
                    >
                        Таълим қўшиш
                    </button>
                </div>


                {/* Xalq deputatlari */}
                <div className="mb-4">
                    <label htmlFor="XalqDeputatlari" className="block mb-2">
                        Халқ депутатлари республика, вилоят, шаҳар ва туман Кенгаши депутатими ёки бошқа сайланадиган органларнинг аъзосими
                    </label>
                    <textarea
                        id="XalqDeputatlari"
                        rows={3}
                        placeholder="Мисол: Ўзбекистон Республикаси Олий Мажлиси депутати"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.personal_information.xalq_deputatlari || ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            personal_information: { ...formData.personal_information, xalq_deputatlari: e.target.value }
                        })}
                    />
                </div>

                {/* Qarindoshlar bloki */}
                <hr className="my-4 border-gray-300" />
                <h5 className="block mb-4 text-lg font-semibold">Қариндошлари ҳақида маълумот</h5>
                {formData.relatives.map((relative, index) => (
                    <div key={index} className="mb-4 flex gap-2">
                        <div className="w-full">
                            <h6 className="mb-3 font-semibold">
                                {index + 1}. Қариндош - <b>{relative.qarindoshligi}</b>
                            </h6>
                            <label htmlFor={`Qarindoshligi-${index}`} className="block mb-2">
                                Қариндошлиги <span className="text-red-500">*</span>
                            </label>
                            <select
                                id={`Qarindoshligi-${index}`}
                                required
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={relative.qarindoshligi}
                                onChange={(e) => {
                                    const newRelatives = [...formData.relatives];
                                    newRelatives[index].qarindoshligi = e.target.value as RelativeType;
                                    setFormData({ ...formData, relatives: newRelatives });
                                }}
                            >
                                <option value="Otasi">Otasi</option>
                                <option value="Onasi">Onasi</option>
                                <option value="Akasi">Akasi</option>
                                <option value="Ukasi">Ukasi</option>
                                <option value="Opasi">Opasi</option>
                            </select>

                            <label htmlFor={`FIO-${index}`} className="mt-3 block mb-2">
                                F.I.Sh. <span className="text-red-500">*</span>
                            </label>
                            <input
                                id={`FIO-${index}`}
                                type="text"
                                required
                                placeholder="Мисол: Абдуллаев Баҳодир Салимович"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={relative.fio}
                                onChange={(e) => {
                                    const newRelatives = [...formData.relatives];
                                    newRelatives[index].fio = e.target.value;
                                    setFormData({ ...formData, relatives: newRelatives });
                                }}
                            />

                            <label htmlFor={`Tugilgan-${index}`} className="mt-3 block mb-2">
                                Тўғилган йили ва жойи <span className="text-red-500">*</span>
                            </label>
                            <input
                                id={`Tugilgan-${index}`}
                                type="text"
                                required
                                placeholder="Мисол: 1941 йил, Самарқанд шаҳри"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={relative.tugilgan}
                                onChange={(e) => {
                                    const newRelatives = [...formData.relatives];
                                    newRelatives[index].tugilgan = e.target.value;
                                    setFormData({ ...formData, relatives: newRelatives });
                                }}
                            />

                            <label className="flex gap-2 items-center mt-3 mb-3">
                                <input
                                    className="w-4 h-4"
                                    type="checkbox"
                                    checked={relative.vafot_etgan}
                                    onChange={(e) => {
                                        const newRelatives = [...formData.relatives];
                                        newRelatives[index].vafot_etgan = e.target.checked;
                                        // Agar vafot_etgan false bo'lsa, vafot_etgan_yili va kasbi ni tozalash
                                        if (!e.target.checked) {
                                            newRelatives[index].vafot_etgan_yili = '';
                                            newRelatives[index].kasbi = '';
                                        } else {
                                            // Agar vafot_etgan true bo'lsa, ish_joyi va turar_joyi ni tozalash
                                            newRelatives[index].ish_joyi = '';
                                            newRelatives[index].turar_joyi = '';
                                        }
                                        setFormData({ ...formData, relatives: newRelatives });
                                    }}
                                />
                                <span>Вафот этган</span>
                            </label>

                            {relative.vafot_etgan ? (
                                <>
                                    <label htmlFor={`VafotEtganYili-${index}`} className="block mb-2">
                                        Вафот этган йили <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id={`VafotEtganYili-${index}`}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={relative.vafot_etgan_yili || ''}
                                        onChange={(e) => {
                                            const newRelatives = [...formData.relatives];
                                            newRelatives[index].vafot_etgan_yili = e.target.value;
                                            setFormData({ ...formData, relatives: newRelatives });
                                        }}
                                    >
                                        <option value="">Йилни танланг</option>
                                        {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => {
                                            const year = 1900 + i;
                                            return (
                                                <option key={year} value={year.toString()}>
                                                    {year}
                                                </option>
                                            );
                                        }).reverse()}
                                    </select>

                                    <label htmlFor={`Kasbi-${index}`} className="mt-3 block mb-2">
                                        Касби <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id={`Kasbi-${index}`}
                                        type="text"
                                        required
                                        placeholder="Мисол: мактаб ўқитувчиси"
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={relative.kasbi || ''}
                                        onChange={(e) => {
                                            const newRelatives = [...formData.relatives];
                                            newRelatives[index].kasbi = e.target.value;
                                            setFormData({ ...formData, relatives: newRelatives });
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <label htmlFor={`Ishjoyi-${index}`} className="block mb-2">
                                        Иш жойи ва лавозими <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id={`Ishjoyi-${index}`}
                                        type="text"
                                        required
                                        placeholder="Мисол: Пенсияда (Тошкент давлат"
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={relative.ish_joyi || ''}
                                        onChange={(e) => {
                                            const newRelatives = [...formData.relatives];
                                            newRelatives[index].ish_joyi = e.target.value;
                                            setFormData({ ...formData, relatives: newRelatives });
                                        }}
                                    />

                                    <label htmlFor={`Turarjoyi-${index}`} className="mt-3 block mb-2">
                                        Турар жойи <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id={`Turarjoyi-${index}`}
                                        type="text"
                                        required
                                        placeholder="Мисол: Тошкент шаҳри, Мирзо Улуғбек тумани"
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={relative.turar_joyi || ''}
                                        onChange={(e) => {
                                            const newRelatives = [...formData.relatives];
                                            newRelatives[index].turar_joyi = e.target.value;
                                            setFormData({ ...formData, relatives: newRelatives });
                                        }}
                                    />
                                </>
                            )}

                            {formData.relatives.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeRelative(index)}
                                    className="mt-3 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Қариндошни ўчириш
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addRelative}
                    className="w-full px-3 py-2 my-2 border border-gray-300 rounded bg-white hover:bg-gray-100 text-sm"
                >
                    Қариндош қўшиш
                </button>

                {message && (
                    <div className={`mb-4 p-3 rounded ${message.includes('Muvaffaqiyatli') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
                >
                    {isPending ? 'Yuklanmoqda...' : (documentId ? 'Yangilash' : 'Tasdiqlash')}
                </button>
            </form>
        </div>
    );
}

