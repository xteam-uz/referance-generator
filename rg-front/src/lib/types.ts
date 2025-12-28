// Backend dan keladigan ma'lumotlar uchun type definitions
// Misol: Reference Generator uchun

export interface Reference {
    id: number;
    title: string;
    author: string;
    year: number;
    type: 'book' | 'article' | 'website' | 'other';
    created_at: string;
    updated_at: string;
}

export interface CreateReferenceDto {
    title: string;
    author: string;
    year: number;
    type: 'book' | 'article' | 'website' | 'other';
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

// Document types
export type DocumentType = 'obyektivka' | 'ishga_olish_ariza' | 'kochirish_ariza';
export type EducationLevel = 'Oliy' | 'O\'rta maxsus' | 'O\'rta';
export type RelativeType = 'Otasi' | 'Onasi' | 'Akasi' | 'Ukasi' | 'Opasi';

export interface PersonalInformation {
    id: number;
    document_id: number;
    familya: string;
    ism: string;
    sharif: string;
    photo_path: string | null;
    joriy_lavozim_sanasi: string;
    joriy_lavozim_toliq: string;
    tugilgan_sana: string;
    tugilgan_joyi: string;
    millati: string;
    partiyaviyligi: string | null;
    malumoti: EducationLevel;
    malumoti_boyicha_mutaxassisligi: string | null;
    qaysi_chet_tillarini_biladi: string | null;
    xalq_deputatlari: string | null;
    created_at: string;
    updated_at: string;
}

export interface EducationRecord {
    id: number;
    document_id: number;
    description: string;
    order_index: number;
    created_at: string;
    updated_at: string;
}

export interface Relative {
    id: number;
    document_id: number;
    qarindoshligi: RelativeType;
    fio: string;
    tugilgan: string;
    vafot_etgan: boolean;
    ish_joyi: string;
    turar_joyi: string;
    order_index: number;
    created_at: string;
    updated_at: string;
}

export interface Document {
    id: number;
    user_id: number;
    document_type: DocumentType;
    status: string;
    created_at: string;
    updated_at: string;
    personal_information?: PersonalInformation;
    education_records?: EducationRecord[];
    relatives?: Relative[];
}

export interface CreateDocumentDto {
    document_type: DocumentType;
    photo?: File;
    personal_information: {
        familya: string;
        ism: string;
        sharif: string;
        joriy_lavozim_sanasi: string;
        joriy_lavozim_toliq: string;
        tugilgan_sana: string;
        tugilgan_joyi: string;
        millati: string;
        partiyaviyligi?: string;
        malumoti: EducationLevel;
        malumoti_boyicha_mutaxassisligi?: string;
        qaysi_chet_tillarini_biladi?: string;
        xalq_deputatlari?: string;
    };
    education_records: Array<{
        description: string;
    }>;
    relatives: Array<{
        qarindoshligi: RelativeType;
        fio: string;
        tugilgan: string;
        vafot_etgan?: boolean;
        ish_joyi: string;
        turar_joyi: string;
    }>;
}

export interface UpdateDocumentDto extends Partial<CreateDocumentDto> {
    photo?: File;
    status?: string;
}

