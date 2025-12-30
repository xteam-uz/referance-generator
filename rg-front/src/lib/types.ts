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
export type EducationLevel = 'Олий' | 'Махсус' | 'Ўрта';
export type RelativeType = 'Otasi' | 'Onasi' | 'Akasi' | 'Ukasi' | 'Opasi';

export interface PersonalInformation {
    id: number;
    document_id: number;
    familya: string;
    ism: string;
    sharif: string;
    photo_path: string | null;
    tugilgan_sana: string;
    tugilgan_joyi: string;
    millati: string;
    partiyaviyligi: string | null;
    xalq_deputatlari: string | null;
    created_at: string;
    updated_at: string;
}

export interface EducationRecord {
    id: number;
    document_id: number;
    malumoti: EducationLevel;
    tamomlagan: string | null;
    mutaxassisligi: string | null;
    ilmiy_daraja: string | null;
    ilmiy_unvoni: string | null;
    chet_tillari: string | null;
    maxsus_unvoni: string | null;
    davlat_mukofoti: string | null;
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
    ish_joyi: string | null;
    turar_joyi: string | null;
    vafot_etgan_yili: string | null;
    kasbi: string | null;
    order_index: number;
    created_at: string;
    updated_at: string;
}

export interface WorkExperience {
    id: number;
    document_id: number;
    start_date: string;
    end_date: string | null;
    info: string;
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
    work_experiences?: WorkExperience[];
}

export interface CreateDocumentDto {
    document_type: DocumentType;
    photo?: File;
    personal_information: {
        familya: string;
        ism: string;
        sharif: string;
        tugilgan_sana: Date;
        tugilgan_joyi: string;
        millati: string;
        partiyaviyligi?: string;
        xalq_deputatlari?: string;
    };
    work_experiences: Array<{
        start_date: Date;
        end_date?: Date | null;
        info: string;
    }>;
    education_records: Array<{
        malumoti: EducationLevel;
        tamomlagan?: string;
        mutaxassisligi?: string;
        ilmiy_daraja?: string;
        ilmiy_unvoni?: string;
        chet_tillari?: string;
        maxsus_unvoni?: string;
        davlat_mukofoti?: string;
    }>;
    relatives: Array<{
        qarindoshligi: RelativeType;
        fio: string;
        tugilgan: string;
        vafot_etgan?: boolean;
        ish_joyi?: string;
        turar_joyi?: string;
        vafot_etgan_yili?: string;
        kasbi?: string;
    }>;
}

export interface UpdateDocumentDto extends Partial<CreateDocumentDto> {
    photo?: File;
    status?: string;
}

